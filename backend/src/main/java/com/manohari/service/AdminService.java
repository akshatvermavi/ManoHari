package com.manohari.service;
import com.manohari.dto.request.CreateAdminRequest;
import com.manohari.dto.request.CreateProductRequest;
import com.manohari.dto.request.UpdateProductRequest;
import com.manohari.dto.response.*;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
public interface AdminService {
    Map<String, Object> getDashboardStats();
    ProductResponse createProduct(CreateProductRequest request, List<MultipartFile> images);
    ProductResponse updateProduct(String id, UpdateProductRequest request, List<MultipartFile> images);
    void deleteProduct(String id);
    ProductResponse toggleProductStatus(String id);
    PageResponse<ProductResponse> getAllProducts(Pageable pageable, String search);
    PageResponse<OrderResponse> getAllOrders(Pageable pageable, String status);
    OrderResponse updateOrderStatus(String orderId, String status, String message);
    PageResponse<UserResponse> getAllUsers(Pageable pageable);
    void toggleUserStatus(String userId);
    UserResponse createAdmin(CreateAdminRequest request);
    void updatePaymentConfig(Map<String, String> config);
}
