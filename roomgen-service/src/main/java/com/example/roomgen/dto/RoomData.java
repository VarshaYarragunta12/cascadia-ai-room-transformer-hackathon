package com.example.roomgen.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RoomData {
    private String roomImageUrl;
    private String roomType;
    private List<String> existingFurniture;
    private List<String> issues;
    private List<String> colorPalette;
    private String styleInference;
    private String vibe;
    private String userRequirement;

    public String getRoomImageUrl() { return roomImageUrl; }
    public void setRoomImageUrl(String roomImageUrl) { this.roomImageUrl = roomImageUrl; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public List<String> getExistingFurniture() { return existingFurniture; }
    public void setExistingFurniture(List<String> existingFurniture) { this.existingFurniture = existingFurniture; }

    public List<String> getIssues() { return issues; }
    public void setIssues(List<String> issues) { this.issues = issues; }

    public List<String> getColorPalette() { return colorPalette; }
    public void setColorPalette(List<String> colorPalette) { this.colorPalette = colorPalette; }

    public String getStyleInference() { return styleInference; }
    public void setStyleInference(String styleInference) { this.styleInference = styleInference; }

    public String getVibe() { return vibe; }
    public void setVibe(String vibe) { this.vibe = vibe; }

    public String getUserRequirement() { return userRequirement; }
    public void setUserRequirement(String userRequirement) { this.userRequirement = userRequirement; }
}
