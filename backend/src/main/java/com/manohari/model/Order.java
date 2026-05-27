package com.manohari.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String orderNumber;

    @Indexed
    private String userId;

    private List<OrderItem> items;

    private User.Address shippingAddress;

    private BigDecimal subtotal;

    private BigDecimal deliveryCharge;

    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    private BigDecimal totalAmount;

    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    private Payment payment;

    @Builder.Default
    private List<OrderStatusHistory> statusHistory = new java.util.ArrayList<>();

    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum OrderStatus {
        PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productId;
        private String productTitle;
        private String productImage;
        private String color;
        private String size;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal totalPrice;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Payment {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
        private PaymentMethod method;
        private PaymentStatus status;
        private BigDecimal amount;
        private LocalDateTime paidAt;
    }

    public enum PaymentMethod {
        UPI, CARD, NET_BANKING, WALLET, COD
    }

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, REFUNDED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatusHistory {
        private OrderStatus status;
        private String message;
        private LocalDateTime timestamp;
    }
}
