package com.manohari.dto.response;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
@Data @Builder
public class CartResponse {
    private String id;
    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
    private int totalItems;

    @Data @Builder
    public static class CartItemResponse {
        private String productId;
        private String productTitle;
        private String productImage;
        private String color;
        private String size;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal totalPrice;
    }
}
