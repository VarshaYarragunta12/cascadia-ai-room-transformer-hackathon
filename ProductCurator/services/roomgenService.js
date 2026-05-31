'use strict';

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const zlib = require('zlib');
const https = require('https');
const http = require('http');

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.stability.stable-image-inpaint-v1:0';
const SAMPLE_ROOM_IMAGE =
  process.env.SAMPLE_ROOM_IMAGE ||
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1024';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'RoomTransformer/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Image download failed: HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Image download timed out')); });
  });
}

function getImageDimensions(buf) {
  // PNG: signature 89 50 4E 47, width at offset 16, height at 20
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: scan for SOF0/SOF1/SOF2 markers
  if (buf[0] === 0xFF && buf[1] === 0xD8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xFF) { i++; continue; }
      const marker = buf[i + 1];
      if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      if (i + 3 >= buf.length) break;
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return { width: 1024, height: 768 };
}

// Gradient mask: black (preserve) top 20%, gradient 20-40%, white (inpaint) bottom 60%
function generateGradientMaskPng(width, height) {
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (const b of buf) crc = crcTable[(crc ^ b) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function chunk(type, data) {
    const t = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crcBuf]);
  }

  const preserveEnd = Math.floor(height * 0.20);
  const blendEnd    = Math.floor(height * 0.40);
  const blendZone   = blendEnd - preserveEnd;

  const raw = Buffer.alloc(height * (width + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width + 1)] = 0; // filter byte: None
    const px = y <= preserveEnd ? 0
      : y >= blendEnd ? 255
      : Math.round(255 * (y - preserveEnd) / blendZone);
    raw.fill(px, y * (width + 1) + 1, y * (width + 1) + 1 + width);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 0; // bit depth 8, grayscale

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Shorten a long Amazon/IKEA product title to a clean ~4-word furniture label
// e.g. "GarveeHome 5x7 Area Rugs for Living Room, Washable..." → "area rug"
function shortenProductName(name = '') {
  if (!name) return null;
  // Strip brand prefix (first word if it looks like a brand: capitalized, >4 chars, no spaces)
  let s = name.replace(/^[A-Z][a-zA-Z]{3,}\s+/, '').trim();
  // Drop everything after first comma or pipe
  s = s.split(/[,|]/)[0].trim();
  // Drop size specs like "5x7", "60""", "6ft", "8x10", "30""
  s = s.replace(/\b\d+["x×ft]\S*\b/gi, '').trim();
  // Keep only first 5 words so the prompt stays clean
  s = s.split(/\s+/).slice(0, 5).join(' ');
  return s.toLowerCase() || null;
}

function buildPrompt(userPreferences = {}, roomData = {}, products = []) {
  const parts = [];

  // Opening context so Bedrock understands the task
  const roomType = roomData.roomType || 'living room';
  const style = Array.isArray(userPreferences.style)
    ? userPreferences.style.join(', ')
    : userPreferences.style || roomData.styleInference || 'minimalist';
  const vibe = userPreferences.vibe || roomData.vibe || '';
  const colors = (Array.isArray(userPreferences.colors)
    ? userPreferences.colors
    : userPreferences.colors
      ? [userPreferences.colors]
      : Array.isArray(roomData.colorPalette)
        ? roomData.colorPalette
        : []
  ).join(', ');

  parts.push(`Photorealistic ${style} ${roomType} interior design`);

  // Short product names so Bedrock places furniture, not product labels
  const productNames = (products || [])
    .map((p) => shortenProductName(p.name || p.typeName))
    .filter(Boolean)
    .slice(0, 6)
    .join(', ');
  if (productNames) {
    parts.push(`furnished with ${productNames}`);
  }

  if (vibe)   parts.push(`vibe: ${vibe}`);
  if (colors) parts.push(`color palette: ${colors}`);
  parts.push(`${roomType} with sofa seating area, warm natural lighting, high quality render`);

  return parts.join(', ').slice(0, 1024);
}

async function generateRoomImage(userPreferences = {}, roomData = {}, picks = []) {
  const imageUrl = roomData.roomImageUrl || SAMPLE_ROOM_IMAGE;

  const imageBytes = await downloadImage(imageUrl);
  const { width, height } = getImageDimensions(imageBytes);
  const maskBytes = generateGradientMaskPng(width, height);
  const prompt = buildPrompt(userPreferences, roomData, picks);

  const negativePrompt = 'bed, bedroom, mattress, pillow, bedding, headboard, nightstand, sleeping, blurry, low quality, deformed';

  const payload = JSON.stringify({
    prompt,
    negative_prompt: negativePrompt,
    image: imageBytes.toString('base64'),
    mask: maskBytes.toString('base64'),
    grow_mask: 15,
    seed: 42,
    output_format: 'png',
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: Buffer.from(payload),
  });

  const response = await bedrockClient.send(command);
  const result = JSON.parse(Buffer.from(response.body).toString('utf8'));

  const b64 = (result.images && result.images[0]) || result.image;
  if (!b64) throw new Error(`No image returned by Bedrock: ${JSON.stringify(result).slice(0, 200)}`);

  return `data:image/png;base64,${b64}`;
}

module.exports = { generateRoomImage };
