package com.example.roomgen.service;

import com.example.roomgen.dto.GenerateRoomRequest;
import com.example.roomgen.dto.RoomData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class RoomGenerationService {

    private static final Logger log = LoggerFactory.getLogger(RoomGenerationService.class);

    private final RoomImageDownloader imageDownloader;
    private final PromptBuilderService promptBuilder;
    private final BedrockImageService bedrockImageService;

    public RoomGenerationService(RoomImageDownloader imageDownloader,
                                 PromptBuilderService promptBuilder,
                                 BedrockImageService bedrockImageService) {
        this.imageDownloader = imageDownloader;
        this.promptBuilder = promptBuilder;
        this.bedrockImageService = bedrockImageService;
    }

    public byte[] generateRoom(GenerateRoomRequest request) {
        validate(request);

        log.info("Starting room generation pipeline");

        byte[] roomImage = imageDownloader.download(request.getRoomData().getRoomImageUrl());

        String prompt = promptBuilder.buildPrompt(request);
        String maskPrompt = promptBuilder.buildMaskPrompt(request);

        log.info("Built prompt ({} chars) and maskPrompt ({} chars)", prompt.length(), maskPrompt.length());

        byte[] result = bedrockImageService.generateInpaintedImage(roomImage, prompt, maskPrompt);

        log.info("Room generation complete ({} bytes)", result.length);
        return result;
    }

    private void validate(GenerateRoomRequest request) {
        if (request.getRoomData() == null) {
            throw new IllegalArgumentException("roomData is required");
        }
        RoomData room = request.getRoomData();
        if (isBlank(room.getRoomImageUrl())) {
            throw new IllegalArgumentException("roomData.roomImageUrl is required");
        }
        String url = room.getRoomImageUrl().trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            throw new IllegalArgumentException("roomData.roomImageUrl must be a valid HTTP or HTTPS URL");
        }
        if (request.getScrapedProducts() == null) {
            throw new IllegalArgumentException("scrapedProducts is required (may be an empty array)");
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
