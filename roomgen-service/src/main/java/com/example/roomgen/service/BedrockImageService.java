package com.example.roomgen.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class BedrockImageService {

    private static final Logger log = LoggerFactory.getLogger(BedrockImageService.class);

    private final BedrockRuntimeClient bedrockClient;
    private final ObjectMapper objectMapper;

    @Value("${bedrock.model-id}")
    private String modelId;

    @Value("${bedrock.seed:42}")
    private int seed;

    @Value("${bedrock.grow-mask:15}")
    private int growMask;

    public BedrockImageService(BedrockRuntimeClient bedrockClient, ObjectMapper objectMapper) {
        this.bedrockClient = bedrockClient;
        this.objectMapper = objectMapper;
    }

    public byte[] generateInpaintedImage(byte[] imageBytes, String prompt, String maskPrompt) {
        log.info("Invoking Stability Inpaint (model={}, prompt length={})", modelId, prompt.length());
        try {
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            BufferedImage sourceImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (sourceImage == null) {
                throw new IllegalArgumentException("Downloaded room image could not be decoded as an image");
            }
            int width = sourceImage.getWidth();
            int height = sourceImage.getHeight();
            log.info("Source image dimensions: {}x{}", width, height);

            String base64Mask = generateFloorAreaMask(width, height);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("prompt", prompt);
            body.put("image", base64Image);
            body.put("mask", base64Mask);
            body.put("grow_mask", growMask);
            body.put("seed", seed);
            body.put("output_format", "png");

            String jsonBody = objectMapper.writeValueAsString(body);

            InvokeModelRequest invokeRequest = InvokeModelRequest.builder()
                    .modelId(modelId)
                    .contentType("application/json")
                    .accept("application/json")
                    .body(SdkBytes.fromUtf8String(jsonBody))
                    .build();

            InvokeModelResponse response = bedrockClient.invokeModel(invokeRequest);
            String responseBody = response.body().asUtf8String();

            JsonNode root = objectMapper.readTree(responseBody);

            // Handle Stability response: images[] array
            JsonNode imagesNode = root.path("images");
            if (!imagesNode.isMissingNode() && imagesNode.isArray() && imagesNode.size() > 0) {
                log.info("Image generated successfully");
                return Base64.getDecoder().decode(imagesNode.get(0).asText());
            }

            // Fallback: single image field
            JsonNode imageNode = root.path("image");
            if (!imageNode.isMissingNode() && !imageNode.isNull()) {
                log.info("Image generated successfully (single field)");
                return Base64.getDecoder().decode(imageNode.asText());
            }

            throw new RuntimeException("No image returned by Bedrock. Response: " + responseBody);

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Bedrock image generation failed: " + e.getMessage(), e);
        }
    }

    // Gradient mask: fully black (preserve) above 20%, linear ramp 20%→40%, fully white (inpaint) below 40%.
    // The gradient transition zone eliminates the hard seam visible with a binary split.
    // grow_mask in the API request further feathers the edge at the pixel level.
    private String generateFloorAreaMask(int width, int height) throws Exception {
        BufferedImage mask = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_GRAY);

        int preserveEnd = (int) (height * 0.20);
        int blendEnd    = (int) (height * 0.40);
        int blendZone   = blendEnd - preserveEnd;

        for (int y = 0; y < height; y++) {
            int pixel;
            if (y <= preserveEnd) {
                pixel = 0;
            } else if (y >= blendEnd) {
                pixel = 255;
            } else {
                pixel = (int) (255.0 * (y - preserveEnd) / blendZone);
            }
            for (int x = 0; x < width; x++) {
                mask.getRaster().setSample(x, y, 0, pixel);
            }
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(mask, "png", baos);
        return Base64.getEncoder().encodeToString(baos.toByteArray());
    }
}
