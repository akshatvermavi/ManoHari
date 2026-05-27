package com.manohari.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.manohari.dto.request.CreateAdminRequest;
import com.manohari.dto.request.CreateProductRequest;
import com.manohari.dto.request.UpdateProductRequest;
import com.manohari.dto.response.*;
import com.manohari.exception.BadRequestException;
import com.manohari.exception.ResourceNotFoundException;
import com.manohari.model.Order;
import com.manohari.model.Product;
import com.manohari.model.User;
import com.manohari.repository.OrderRepository;
import com.manohari.repository.ProductRepository;
import com.manohari.repository.UserRepository;
import com.manohari.service.AdminService;
import com.manohari.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final Cloudinary cloudinary;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final MongoTemplate mongoTemplate;
    private final ProductServiceImpl productService;

    @Override
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", productRepository.countByActiveTrue());
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("pendingOrders", orderRepository.countByStatus(Order.OrderStatus.PENDING));
        stats.put("confirmedOrders", orderRepository.countByStatus(Order.OrderStatus.CONFIRMED));
        stats.put("shippedOrders", orderRepository.countByStatus(Order.OrderStatus.SHIPPED));
        stats.put("deliveredOrders", orderRepository.countByStatus(Order.OrderStatus.DELIVERED));

        // Revenue from delivered orders
        List<Order> deliveredOrders = orderRepository.findAll().stream()
            .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
            .toList();
        double totalRevenue = deliveredOrders.stream()
            .mapToDouble(o -> o.getTotalAmount().doubleValue())
            .sum();
        stats.put("totalRevenue", totalRevenue);
        stats.put("recentOrders", orderRepository.findAll().stream()
            .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
            .limit(5)
            .map(this::mapOrderToResponse)
            .collect(Collectors.toList()));
        return stats;
    }

    @Override
    public ProductResponse createProduct(CreateProductRequest request, List<MultipartFile> images) {
        List<String> imageUrls = uploadImages(images, "products");

        List<Product.ProductVariant> variants = null;
        if (request.getVariants() != null) {
            variants = request.getVariants().stream()
                .map(v -> Product.ProductVariant.builder()
                    .color(v.getColor()).colorHex(v.getColorHex())
                    .sizes(v.getSizes()).stock(v.getStock()).build())
                .collect(Collectors.toList());
        }

        Product product = Product.builder()
            .title(request.getTitle()).description(request.getDescription())
            .price(request.getPrice()).discountedPrice(request.getDiscountedPrice())
            .discountPercent(request.getDiscountPercent()).images(imageUrls)
            .category(request.getCategory()).subCategory(request.getSubCategory())
            .brand(request.getBrand()).variants(variants)
            .specifications(request.getSpecifications()).tags(request.getTags())
            .stock(request.getStock()).sku(request.getSku())
            .featured(request.isFeatured()).active(true).build();

        Product saved = productRepository.save(product);
        return productService.mapToResponse(saved);
    }

    @Override
    public ProductResponse updateProduct(String id, UpdateProductRequest request, List<MultipartFile> images) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<String> imageUrls = new ArrayList<>();
        if (request.getExistingImages() != null) imageUrls.addAll(request.getExistingImages());
        if (images != null && !images.isEmpty()) imageUrls.addAll(uploadImages(images, "products"));

        if (request.getTitle() != null) product.setTitle(request.getTitle());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getDiscountedPrice() != null) product.setDiscountedPrice(request.getDiscountedPrice());
        if (request.getDiscountPercent() != null) product.setDiscountPercent(request.getDiscountPercent());
        if (!imageUrls.isEmpty()) product.setImages(imageUrls);
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getSubCategory() != null) product.setSubCategory(request.getSubCategory());
        if (request.getBrand() != null) product.setBrand(request.getBrand());
        if (request.getSpecifications() != null) product.setSpecifications(request.getSpecifications());
        if (request.getTags() != null) product.setTags(request.getTags());
        if (request.getStock() != null) product.setStock(request.getStock());
        if (request.getSku() != null) product.setSku(request.getSku());
        if (request.getFeatured() != null) product.setFeatured(request.getFeatured());

        if (request.getVariants() != null) {
            product.setVariants(request.getVariants().stream()
                .map(v -> Product.ProductVariant.builder()
                    .color(v.getColor()).colorHex(v.getColorHex())
                    .sizes(v.getSizes()).stock(v.getStock()).build())
                .collect(Collectors.toList()));
        }

        return productService.mapToResponse(productRepository.save(product));
    }

    @Override
    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
    }

    @Override
    public ProductResponse toggleProductStatus(String id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setActive(!product.isActive());
        return productService.mapToResponse(productRepository.save(product));
    }

    @Override
    public PageResponse<ProductResponse> getAllProducts(Pageable pageable, String search) {
        Query query = new Query().with(pageable);
        if (search != null && !search.isBlank()) {
            query.addCriteria(Criteria.where("title").regex(search, "i"));
        }
        List<Product> products = mongoTemplate.find(query, Product.class);
        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Product.class);
        List<ProductResponse> content = products.stream().map(productService::mapToResponse).toList();
        return PageResponse.<ProductResponse>builder()
            .content(content).page(pageable.getPageNumber()).size(pageable.getPageSize())
            .totalElements(total).totalPages((int) Math.ceil((double) total / pageable.getPageSize()))
            .build();
    }

    @Override
    public PageResponse<OrderResponse> getAllOrders(Pageable pageable, String status) {
        Page<Order> page;
        if (status != null && !status.isBlank()) {
            Query query = new Query(Criteria.where("status").is(Order.OrderStatus.valueOf(status.toUpperCase()))).with(pageable);
            List<Order> orders = mongoTemplate.find(query, Order.class);
            long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Order.class);
            List<OrderResponse> content = orders.stream().map(this::mapOrderToResponse).toList();
            return PageResponse.<OrderResponse>builder()
                .content(content).page(pageable.getPageNumber()).size(pageable.getPageSize())
                .totalElements(total).totalPages((int) Math.ceil((double) total / pageable.getPageSize()))
                .build();
        }
        page = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<OrderResponse> content = page.getContent().stream().map(this::mapOrderToResponse).toList();
        return PageResponse.<OrderResponse>builder()
            .content(content).page(page.getNumber()).size(page.getSize())
            .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
            .last(page.isLast()).build();
    }

    @Override
    public OrderResponse updateOrderStatus(String orderId, String status, String message) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        order.setStatus(newStatus);
        order.getStatusHistory().add(Order.OrderStatusHistory.builder()
            .status(newStatus).message(message != null ? message : "Status updated by admin")
            .timestamp(LocalDateTime.now()).build());
        orderRepository.save(order);

        // Notify user
        userRepository.findById(order.getUserId()).ifPresent(user -> {
            if (user.getEmail() != null) {
                emailService.sendOrderStatusUpdate(user.getEmail(), user.getName(),
                    order.getOrderNumber(), newStatus.name());
            }
        });
        return mapOrderToResponse(order);
    }

    @Override
    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        List<UserResponse> content = page.getContent().stream().map(this::mapUserToResponse).toList();
        return PageResponse.<UserResponse>builder()
            .content(content).page(page.getNumber()).size(page.getSize())
            .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
            .last(page.isLast()).build();
    }

    @Override
    public void toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    @Override
    public UserResponse createAdmin(CreateAdminRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already registered");
        User admin = User.builder()
            .name(request.getName()).email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(User.Role.ADMIN).emailVerified(true).active(true).build();
        return mapUserToResponse(userRepository.save(admin));
    }

    @Override
    public void updatePaymentConfig(Map<String, String> config) {
        log.info("Payment config updated: {}", config);
        // In production store in DB/env. For now log it.
    }

    private List<String> uploadImages(List<MultipartFile> images, String folder) {
        List<String> urls = new ArrayList<>();
        if (images == null) return urls;
        for (MultipartFile file : images) {
            try {
                Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "manohari/" + folder));
                urls.add((String) result.get("secure_url"));
            } catch (IOException e) {
                log.error("Image upload failed: {}", e.getMessage());
            }
        }
        return urls;
    }

    private OrderResponse mapOrderToResponse(Order o) {
        return OrderResponse.builder()
            .id(o.getId()).orderNumber(o.getOrderNumber()).userId(o.getUserId())
            .items(o.getItems()).shippingAddress(o.getShippingAddress())
            .subtotal(o.getSubtotal()).deliveryCharge(o.getDeliveryCharge())
            .discount(o.getDiscount()).totalAmount(o.getTotalAmount())
            .status(o.getStatus()).payment(o.getPayment())
            .statusHistory(o.getStatusHistory()).notes(o.getNotes())
            .createdAt(o.getCreatedAt()).build();
    }

    private UserResponse mapUserToResponse(User u) {
        return UserResponse.builder()
            .id(u.getId()).name(u.getName()).email(u.getEmail())
            .phoneNumber(u.getPhoneNumber()).profileImage(u.getProfileImage())
            .role(u.getRole()).emailVerified(u.isEmailVerified())
            .phoneVerified(u.isPhoneVerified()).active(u.isActive())
            .addresses(u.getAddresses()).createdAt(u.getCreatedAt()).build();
    }
}
