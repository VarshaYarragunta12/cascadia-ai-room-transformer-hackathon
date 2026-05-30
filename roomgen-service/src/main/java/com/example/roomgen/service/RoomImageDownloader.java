package com.example.roomgen.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class RoomImageDownloader {

    private static final Logger log = LoggerFactory.getLogger(RoomImageDownloader.class);

    @Value("${downloader.max-bytes:10485760}")
    private long maxBytes;

    @Value("${downloader.connect-timeout-seconds:5}")
    private int connectTimeoutSeconds;

    @Value("${downloader.read-timeout-seconds:15}")
    private int readTimeoutSeconds;

    public byte[] download(String url) {
        log.info("Downloading room image");

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(connectTimeoutSeconds))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(readTimeoutSeconds))
                .GET()
                .build();

        HttpResponse<byte[]> response;
        try {
            response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to reach room image URL: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalArgumentException("Room image download interrupted");
        }

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalArgumentException("Room image URL returned HTTP " + response.statusCode());
        }

        String contentType = response.headers().firstValue("content-type").orElse("");
        if (!contentType.startsWith("image/")) {
            throw new IllegalArgumentException(
                    "Room image URL did not return an image (content-type: " + contentType + ")");
        }

        byte[] body = response.body();
        if (body.length > maxBytes) {
            throw new IllegalArgumentException(
                    "Room image exceeds maximum allowed size (" + maxBytes / 1024 / 1024 + " MB)");
        }

        log.info("Room image downloaded successfully ({} bytes)", body.length);
        return body;
    }
}
