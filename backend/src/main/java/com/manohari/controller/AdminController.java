package com.manohari.controller;

import com.manohari.dto.request.CreateProductRequest;
import com.manohari.dto.request.UpdateProductRequest;
import com.manohari.dto.request.CreateAdminRequest;
import com.manohari.dto.response.*;
import com.manohari.service.AdminService;
import com.manohari.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;

    // ─── Dashboard ───
    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    // ─── Product Management ───
    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @RequestPart("product") @Valid CreateProductRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        ProductResponse product = adminService.createProduct(request, images);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @PutMapping(value = "/products/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable String id,
            @RequestPart("product") @Valid UpdateProductRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        ProductResponse product = adminService.updateProduct(id, request, images);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable String id) {
        adminService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted"));
    }

    @PatchMapping("/products/{id}/toggle")
    public ResponseEntity<ApiResponse<ProductResponse>> toggleProductStatus(@PathVariable String id) {
        ProductResponse product = adminService.toggleProductStatus(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllProducts(pageable, search)));
    }

    // ─── Order Management ───
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllOrders(pageable, status)));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status,
            @RequestParam(required = false) String message) {
        OrderResponse order = adminService.updateOrderStatus(orderId, status, message);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    // ─── User Management ───
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(pageable)));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<String>> toggleUserStatus(@PathVariable String userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.success("User status updated"));
    }

    // ─── Admin Management (SUPER_ADMIN only) ───
    @PostMapping("/create-admin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        UserResponse admin = adminService.createAdmin(request);
        return ResponseEntity.ok(ApiResponse.success(admin));
    }

    // ─── Payment Config (add more payment receivers) ───
    @PostMapping("/payment-config")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<String>> updatePaymentConfig(@RequestBody Map<String, String> config) {
        adminService.updatePaymentConfig(config);
        return ResponseEntity.ok(ApiResponse.success("Payment config updated"));
    }
}
