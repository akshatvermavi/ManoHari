package com.manohari.controller;

import com.manohari.dto.request.CreateOrderRequest;
import com.manohari.dto.request.PaymentVerifyRequest;
import com.manohari.dto.response.ApiResponse;
import com.manohari.dto.response.OrderResponse;
import com.manohari.dto.response.PageResponse;
import com.manohari.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request) {
        Map<String, Object> result = orderService.createOrder(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<ApiResponse<OrderResponse>> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentVerifyRequest request) {
        OrderResponse order = orderService.verifyPayment(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<OrderResponse> orders = orderService.getUserOrders(
            userDetails.getUsername(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String orderId) {
        OrderResponse order = orderService.getOrderById(userDetails.getUsername(), orderId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String orderId) {
        OrderResponse order = orderService.cancelOrder(userDetails.getUsername(), orderId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
}
