package com.manohari.service;
import com.manohari.dto.response.PageResponse;
import com.manohari.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;
import java.util.List;
public interface ProductService {
    PageResponse<ProductResponse> getProducts(Pageable pageable, String category, String brand, Double minPrice, Double maxPrice);
    ProductResponse getProductById(String id);
    List<ProductResponse> getFeaturedProducts();
    List<ProductResponse> getNewArrivals();
    PageResponse<ProductResponse> getProductsByCategory(String category, Pageable pageable);
}
