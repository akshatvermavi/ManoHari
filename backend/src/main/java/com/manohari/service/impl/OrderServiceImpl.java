package com.manohari.service.impl;

import com.manohari.dto.request.CreateOrderRequest;
import com.manohari.dto.request.PaymentVerifyRequest;
import com.manohari.dto.response.OrderResponse;
import com.manohari.dto.response.PageResponse;
import com.manohari.exception.BadRequestException;
import com.manohari.exception.ResourceNotFoundException;
import com.manohari.model.*;
import com.manohari.repository.*;
import com.manohari.service.EmailService;
import com.manohari.service.OrderService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    public Map<String, Object> createOrder(String identifier, CreateOrderRequest request) {
        User user = getUserByIdentifier(identifier);
        Cart cart = cartRepository.findByUserId(user.getId())
            .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Find address
        User.Address address = user.getAddresses().stream()
            .filter(a -> a.getId().equals(request.getAddressId()))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        // Calculate totals
        BigDecimal subtotal = cart.getItems().stream()
            .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deliveryCharge = subtotal.compareTo(BigDecimal.valueOf(499)) >= 0
            ? BigDecimal.ZERO : BigDecimal.valueOf(49);
        BigDecimal totalAmount = subtotal.add(deliveryCharge);

        // Build order items
        List<Order.OrderItem> orderItems = cart.getItems().stream()
            .map(item -> Order.OrderItem.builder()
                .productId(item.getProductId())
                .productTitle(item.getProductTitle())
                .productImage(item.getProductImage())
                .color(item.getColor())
                .size(item.getSize())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .totalPrice(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build())
            .collect(Collectors.toList());

        // Create Razorpay order
        String razorpayOrderId = createRazorpayOrder(totalAmount);

        // Save order
        String orderNumber = "MH" + System.currentTimeMillis();
        Order order = Order.builder()
            .orderNumber(orderNumber)
            .userId(user.getId())
            .items(orderItems)
            .shippingAddress(address)
            .subtotal(subtotal)
            .deliveryCharge(deliveryCharge)
            .totalAmount(totalAmount)
            .status(Order.OrderStatus.PENDING)
            .payment(Order.Payment.builder()
                .razorpayOrderId(razorpayOrderId)
                .status(Order.PaymentStatus.PENDING)
                .amount(totalAmount)
                .build())
            .notes(request.getNotes())
            .build();

        Order savedOrder = orderRepository.save(order);

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", savedOrder.getId());
        result.put("orderNumber", orderNumber);
        result.put("razorpayOrderId", razorpayOrderId);
        result.put("razorpayKeyId", razorpayKeyId);
        result.put("amount", totalAmount.multiply(BigDecimal.valueOf(100)).intValue()); // paise
        result.put("currency", "INR");

        return result;
    }

    @Override
    public OrderResponse verifyPayment(String identifier, PaymentVerifyRequest request) {
        // Verify Razorpay signature
        boolean valid = verifyRazorpaySignature(
            request.getRazorpayOrderId(),
            request.getRazorpayPaymentId(),
            request.getRazorpaySignature()
        );

        if (!valid) {
            throw new BadRequestException("Payment verification failed");
        }

        Order order = orderRepository.findById(request.getOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(Order.OrderStatus.CONFIRMED);
        order.getPayment().setRazorpayPaymentId(request.getRazorpayPaymentId());
        order.getPayment().setRazorpaySignature(request.getRazorpaySignature());
        order.getPayment().setStatus(Order.PaymentStatus.SUCCESS);
        order.getPayment().setPaidAt(LocalDateTime.now());
        order.getStatusHistory().add(Order.OrderStatusHistory.builder()
            .status(Order.OrderStatus.CONFIRMED)
            .message("Payment received successfully")
            .timestamp(LocalDateTime.now())
            .build());

        orderRepository.save(order);

        // Clear cart
        User user = getUserByIdentifier(identifier);
        cartRepository.deleteByUserId(user.getId());

        // Send email
        if (user.getEmail() != null) {
            emailService.sendOrderConfirmation(user.getEmail(), user.getName(), order.getOrderNumber());
        }

        return mapToResponse(order);
    }

    @Override
    public PageResponse<OrderResponse> getUserOrders(String identifier, Pageable pageable) {
        User user = getUserByIdentifier(identifier);
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        List<OrderResponse> content = orders.getContent().stream().map(this::mapToResponse).toList();
        return PageResponse.<OrderResponse>builder()
            .content(content)
            .page(orders.getNumber())
            .size(orders.getSize())
            .totalElements(orders.getTotalElements())
            .totalPages(orders.getTotalPages())
            .last(orders.isLast())
            .build();
    }

    @Override
    public OrderResponse getOrderById(String identifier, String orderId) {
        User user = getUserByIdentifier(identifier);
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return mapToResponse(order);
    }

    @Override
    public OrderResponse cancelOrder(String identifier, String orderId) {
        User user = getUserByIdentifier(identifier);
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() == Order.OrderStatus.DELIVERED ||
            order.getStatus() == Order.OrderStatus.SHIPPED) {
            throw new BadRequestException("Cannot cancel a shipped or delivered order");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.getStatusHistory().add(Order.OrderStatusHistory.builder()
            .status(Order.OrderStatus.CANCELLED)
            .message("Order cancelled by customer")
            .timestamp(LocalDateTime.now())
            .build());
        orderRepository.save(order);
        return mapToResponse(order);
    }

    private String createRazorpayOrder(BigDecimal amount) {
        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "mh_" + UUID.randomUUID().toString().substring(0, 8));
            com.razorpay.Order razorpayOrder = client.orders.create(orderRequest);
            return razorpayOrder.get("id");
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw new RuntimeException("Payment gateway error");
        }
    }

    private boolean verifyRazorpaySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            log.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }

    private User getUserByIdentifier(String identifier) {
        return userRepository.findByEmail(identifier)
            .or(() -> userRepository.findByPhoneNumber(identifier))
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
            .id(order.getId())
            .orderNumber(order.getOrderNumber())
            .userId(order.getUserId())
            .items(order.getItems())
            .shippingAddress(order.getShippingAddress())
            .subtotal(order.getSubtotal())
            .deliveryCharge(order.getDeliveryCharge())
            .discount(order.getDiscount())
            .totalAmount(order.getTotalAmount())
            .status(order.getStatus())
            .payment(order.getPayment())
            .statusHistory(order.getStatusHistory())
            .notes(order.getNotes())
            .createdAt(order.getCreatedAt())
            .build();
    }
}
