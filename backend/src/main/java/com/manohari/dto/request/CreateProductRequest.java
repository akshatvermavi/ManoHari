package com.manohari.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class CreateProductRequest {
    @NotBlank private String title;
    @NotBlank private String description;
    @NotNull @Positive private BigDecimal price;
    private BigDecimal discountedPrice;
    private Integer discountPercent;
    @NotBlank private String category;
    private String subCategory;
    private String brand;
    private List<ProductVariantDto> variants;
    private Map<String, String> specifications;
    private List<String> tags;
    @NotNull @Positive private Integer stock;
    private String sku;
    private boolean featured;

    @Data
    public static class ProductVariantDto {
        private String color;
        private String colorHex;
        private List<String> sizes;
        private Integer stock;
    }
}
