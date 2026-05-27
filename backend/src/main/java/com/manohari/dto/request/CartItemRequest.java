package com.manohari.dto.request;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class CartItemRequest {
    @NotBlank private String productId;
    private String color;
    private String size;
    @Min(1) private Integer quantity;
}
