package com.manohari.dto.response;

import com.manohari.model.Order;
import com.manohari.model.User;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private String id;
    private String orderNumber;
    private String userId;
    private List<Order.OrderItem> items;
    private User.Address shippingAddress;
    private BigDecimal subtotal;
    private BigDecimal deliveryCharge;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private Order.Payment payment;
    private List<Order.OrderStatusHistory> statusHistory;
    private String notes;
    private LocalDateTime createdAt;
}
