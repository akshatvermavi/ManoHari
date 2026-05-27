package com.manohari.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.index.Indexed;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    @TextIndexed(weight = 3)
    private String title;

    @TextIndexed(weight = 2)
    private String description;

    private BigDecimal price;

    private BigDecimal discountedPrice;

    private Integer discountPercent;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Indexed
    private String category;

    private String subCategory;

    @TextIndexed(weight = 2)
    private String brand;

    // Variants: color, size, etc.
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    // Specifications: key-value pairs (e.g., Material: Cotton, Fit: Regular)
    private Map<String, String> specifications;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private Integer stock;

    private String sku;

    @Builder.Default
    private double rating = 0.0;

    @Builder.Default
    private int reviewCount = 0;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    private boolean featured = false;

    private String createdBy;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductVariant {
        private String color;
        private String colorHex;
        private List<String> sizes;
        private List<String> variantImages;
        private Integer stock;
    }
}
