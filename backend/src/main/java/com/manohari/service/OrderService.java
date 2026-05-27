package com.manohari.service;
import com.manohari.dto.request.CreateOrderRequest;
import com.manohari.dto.request.PaymentVerifyRequest;
import com.manohari.dto.response.OrderResponse;
import com.manohari.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;
import java.util.Map;
public interface OrderService {
    Map<String, Object> createOrder(String identifier, CreateOrderRequest request);
    OrderResponse verifyPayment(String identifier, PaymentVerifyRequest request);
    PageResponse<OrderResponse> getUserOrders(String identifier, Pageable pageable);
    OrderResponse getOrderById(String identifier, String orderId);
    OrderResponse cancelOrder(String identifier, String orderId);
}
