const _nf = require('node-fetch');
if (!globalThis.fetch)   globalThis.fetch   = _nf.default;
if (!globalThis.Headers) globalThis.Headers = _nf.Headers;
if (!globalThis.Request) globalThis.Request = _nf.Request;
if (!globalThis.Response) globalThis.Response = _nf.Response;
require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const mockRoom = require('./mockRoom.json');
const { calculateBudget } = require('./services/budgetService');
const { curateProducts } = require('./services/claudeService');
const { scrapeAmazonProducts, scrapeIkeaProducts } = require('./services/apifyService');
const { generateRoomImage } = require('./services/roomgenService');

const app = express();
const PORT = process.env.PORT || 4000;
const DEFAULT_MAX_ITEMS = Number(process.env.DEFAULT_MAX_ITEMS || 20);
const DEFAULT_MAX_PAGES = Number(process.env.DEFAULT_MAX_PAGES || 2);

app.use(express.json());

// 3 runs per IP per hour — protects API credits from abuse
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests — please try again in an hour.' },
});
app.use('/curate-products', limiter);

// Allow the frontend (Vite dev server on :5173) to call this API from the browser.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.get('/', (req, res) => {
    res.json({
        message: 'AI Room Transformer Product Curator is running'
    });
});

app.post('/curate-products', async (req, res) => {
    const userPreferences = req.body.userPreferences || req.body;
    let scrapedProducts = req.body.scrapedProducts || [];
    // Use the real room analysis from P2 (Vision AI) when provided; fall back to
    // the mock room so the endpoint still works standalone during development.
    const roomProfile = req.body.roomProfile || req.body.roomAnalysis || mockRoom;

    try {
        if (!Array.isArray(scrapedProducts) || scrapedProducts.length === 0) {
            const maxItems = DEFAULT_MAX_ITEMS;
            const maxPages = DEFAULT_MAX_PAGES;
            const ikeaMaxItems = 2;

            const [amazonProducts, ikeaProducts] = await Promise.all([
                scrapeAmazonProducts(userPreferences, { maxItems, maxPages }),
                scrapeIkeaProducts(userPreferences, { maxItems: ikeaMaxItems, maxPages: 1 }),
            ]);

            scrapedProducts = [
                ...amazonProducts.slice(0, maxItems),
                ...ikeaProducts.slice(0, ikeaMaxItems),
            ];
        }

        const aiResult = await curateProducts(userPreferences, roomProfile, scrapedProducts);

        const picks = [aiResult.topPick, ...(aiResult.supportingPicks || [])].filter(Boolean);

        const totalBudget = userPreferences.budget || roomProfile.overallBudget;
        const budgetSummary = calculateBudget(picks, totalBudget);

        // Generate the "after" room image from the curated picks (P2/Bedrock,
        // server-to-server). If it fails, still return the curation.
        let generatedImage = null;
        try {
            const roomImageBase64 = req.body.roomImageBase64 || null;
            generatedImage = await generateRoomImage(userPreferences, roomProfile, picks, roomImageBase64);
        } catch (err) {
            console.error('Room image generation failed:', err.message);
        }

        res.json({
            status: 'success',
            inputReceived: req.body,
            roomProfile,
            scrapedProducts,
            result: {
                ...aiResult,
                generatedImage,
                totalCost: budgetSummary.totalCost,
                remainingBudget: budgetSummary.remainingBudget,
                isOverBudget: budgetSummary.isOverBudget,
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to curate products',
            details: error.stack,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});