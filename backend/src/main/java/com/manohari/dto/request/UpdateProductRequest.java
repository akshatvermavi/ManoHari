package com.manohari.dto.request;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
@Data
public class UpdateProductRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private Integer discountPercent;
    private String category;
    private String subCategory;
    private String brand;
    private List<CreateProductRequest.ProductVariantDto> variants;
    private Map<String, String> specifications;
    private List<String> tags;
    private Integer stock;
    private String sku;
    private Boolean featured;
    private List<String> existingImages; // keep these existing cloudinary images
}
