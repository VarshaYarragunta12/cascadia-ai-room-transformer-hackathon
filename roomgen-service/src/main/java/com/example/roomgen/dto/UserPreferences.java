package com.example.roomgen.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UserPreferences {
    private String items;
    private List<String> style;
    private List<String> colors;
    private String vibe;

    public String getItems() { return items; }
    public void setItems(String items) { this.items = items; }

    public List<String> getStyle() { return style; }
    public void setStyle(List<String> style) { this.style = style; }

    public List<String> getColors() { return colors; }
    public void setColors(List<String> colors) { this.colors = colors; }

    public String getVibe() { return vibe; }
    public void setVibe(String vibe) { this.vibe = vibe; }
}
