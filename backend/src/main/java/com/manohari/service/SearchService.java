package com.manohari.service;
import com.manohari.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;
import java.util.List;
public interface SearchService {
    List<ProductResponse> search(String query, Pageable pageable);
    List<String> getSuggestions(String query);
    List<ProductResponse> suggestProducts(String query, int limit);
}
