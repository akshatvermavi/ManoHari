package com.manohari.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ProductResponse {
    private String id;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private Integer discountPercent;
    private List<String> images;
    private String category;
    private String subCategory;
    private String brand;
    private List<VariantResponse> variants;
    private Map<String, String> specifications;
    private List<String> tags;
    private Integer stock;
    private String sku;
    private double rating;
    private int reviewCount;
    private boolean active;
    private boolean featured;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class VariantResponse {
        private String color;
        private String colorHex;
        private List<String> sizes;
        private List<String> variantImages;
        private Integer stock;
    }
}
