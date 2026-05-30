package com.example.roomgen.controller;

import com.example.roomgen.dto.GenerateRoomRequest;
import com.example.roomgen.service.RoomGenerationService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class RoomGenerationController {

    private final RoomGenerationService roomGenerationService;

    public RoomGenerationController(RoomGenerationService roomGenerationService) {
        this.roomGenerationService = roomGenerationService;
    }

    @PostMapping(
            value = "/generate-room",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.IMAGE_PNG_VALUE
    )
    public ResponseEntity<byte[]> generateRoom(@RequestBody GenerateRoomRequest request) {
        byte[] image = roomGenerationService.generateRoom(request);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(image);
    }
}
