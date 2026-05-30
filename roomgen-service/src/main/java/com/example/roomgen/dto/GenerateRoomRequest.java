package com.example.roomgen.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GenerateRoomRequest {
    private UserPreferences userPreferences;
    private RoomData roomData;
    private List<ScrapedProduct> scrapedProducts;

    public UserPreferences getUserPreferences() { return userPreferences; }
    public void setUserPreferences(UserPreferences userPreferences) { this.userPreferences = userPreferences; }

    public RoomData getRoomData() { return roomData; }
    public void setRoomData(RoomData roomData) { this.roomData = roomData; }

    public List<ScrapedProduct> getScrapedProducts() { return scrapedProducts; }
    public void setScrapedProducts(List<ScrapedProduct> scrapedProducts) { this.scrapedProducts = scrapedProducts; }
}
