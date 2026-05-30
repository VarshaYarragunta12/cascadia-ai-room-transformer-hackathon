package com.example.roomgen.service;

import com.example.roomgen.dto.GenerateRoomRequest;
import com.example.roomgen.dto.RoomData;
import com.example.roomgen.dto.ScrapedProduct;
import com.example.roomgen.dto.UserPreferences;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PromptBuilderService {

    private static final int MAX_PROMPT_CHARS = 1024;

    public String buildPrompt(GenerateRoomRequest request) {
        StringBuilder sb = new StringBuilder();
        RoomData room = request.getRoomData();
        UserPreferences prefs = request.getUserPreferences();
        List<ScrapedProduct> products = request.getScrapedProducts();

        // Priority 1: direct user intent in free text
        if (isNotBlank(room.getUserRequirement())) {
            sb.append(room.getUserRequirement().trim()).append(". ");
        }

        // Priority 2: products to place (authoritative list from upstream scraper)
        if (products != null && !products.isEmpty()) {
            String productList = products.stream()
                    .map(p -> isNotBlank(p.getName()) ? p.getName() : p.getTypeName())
                    .filter(s -> s != null && !s.isBlank())
                    .collect(Collectors.joining(", "));
            if (!productList.isBlank()) {
                String roomType = isNotBlank(room.getRoomType()) ? room.getRoomType() : "room";
                sb.append("Add to this ").append(roomType).append(": ").append(productList).append(". ");
            }
        }

        // Priority 3: style/vibe/colors — prefer userPreferences, fall back to roomData inferences
        String style = listToString(prefs != null ? prefs.getStyle() : null);
        if (style.isBlank() && isNotBlank(room.getStyleInference())) {
            style = room.getStyleInference();
        }

        String vibe = (prefs != null && isNotBlank(prefs.getVibe()))
                ? prefs.getVibe()
                : (isNotBlank(room.getVibe()) ? room.getVibe() : "");

        String colors = listToString(prefs != null ? prefs.getColors() : null);
        if (colors.isBlank()) {
            colors = listToString(room.getColorPalette());
        }

        if (!style.isBlank() || !vibe.isBlank() || !colors.isBlank()) {
            sb.append("Style: ").append(style);
            if (!vibe.isBlank()) sb.append("; vibe: ").append(vibe);
            if (!colors.isBlank()) sb.append("; colors: ").append(colors);
            sb.append(". ");
        }

        // Priority 4: existing furniture and issues as context (lowest priority)
        String existing = listToString(room.getExistingFurniture());
        if (!existing.isBlank()) {
            sb.append("Preserve existing furniture: ").append(existing).append(". ");
        }

        String issues = listToString(room.getIssues());
        if (!issues.isBlank()) {
            sb.append("Address: ").append(issues).append(". ");
        }

        String prompt = sb.toString().trim();
        if (prompt.length() > MAX_PROMPT_CHARS) {
            prompt = prompt.substring(0, MAX_PROMPT_CHARS);
        }
        return prompt;
    }

    public String buildMaskPrompt(GenerateRoomRequest request) {
        List<String> issues = request.getRoomData().getIssues();
        if (issues != null && !issues.isEmpty()) {
            String issueText = issues.stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.joining(", "));
            return issueText + ", empty floor areas, and empty wall space where new furniture can be placed";
        }
        return "empty floor areas, empty corners, and empty wall space where new furniture can be placed";
    }

    private boolean isNotBlank(String s) {
        return s != null && !s.isBlank();
    }

    private String listToString(List<String> list) {
        if (list == null || list.isEmpty()) return "";
        return list.stream()
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.joining(", "));
    }
}
