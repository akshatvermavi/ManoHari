package com.manohari.controller;

import com.manohari.dto.response.ApiResponse;
import com.manohari.dto.response.ProductResponse;
import com.manohari.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size);
        List<ProductResponse> results = searchService.search(q, pageable);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    // Autocomplete / suggestions (used under search bar as you type)
    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<String>>> getSuggestions(@RequestParam String q) {
        List<String> suggestions = searchService.getSuggestions(q);
        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }

    // Full product suggestion cards
    @GetMapping("/suggest-products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> suggestProducts(
            @RequestParam String q,
            @RequestParam(defaultValue = "6") int limit) {
        List<ProductResponse> suggestions = searchService.suggestProducts(q, limit);
        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }
}
