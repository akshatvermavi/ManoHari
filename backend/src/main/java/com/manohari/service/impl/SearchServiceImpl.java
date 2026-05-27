package com.manohari.service.impl;

import com.manohari.dto.response.ProductResponse;
import com.manohari.model.Product;
import com.manohari.repository.ProductRepository;
import com.manohari.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final ProductRepository productRepository;

    @Override
    public List<ProductResponse> search(String query, Pageable pageable) {
        return productRepository.fullTextSearch(query, pageable)
            .getContent().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<String> getSuggestions(String query) {
        if (query == null || query.trim().length() < 2) return List.of();
        return productRepository.findSuggestions(query.trim(), PageRequest.of(0, 8))
            .stream()
            .map(Product::getTitle)
            .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> suggestProducts(String query, int limit) {
        if (query == null || query.trim().length() < 2) return List.of();
        return productRepository.findSuggestions(query.trim(), PageRequest.of(0, limit))
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    private ProductResponse mapToResponse(Product p) {
        List<ProductResponse.VariantResponse> variants = null;
        if (p.getVariants() != null) {
            variants = p.getVariants().stream()
                .map(v -> ProductResponse.VariantResponse.builder()
                    .color(v.getColor())
                    .colorHex(v.getColorHex())
                    .sizes(v.getSizes())
                    .variantImages(v.getVariantImages())
                    .stock(v.getStock())
                    .build())
                .collect(Collectors.toList());
        }
        return ProductResponse.builder()
            .id(p.getId())
            .title(p.getTitle())
            .description(p.getDescription())
            .price(p.getPrice())
            .discountedPrice(p.getDiscountedPrice())
            .discountPercent(p.getDiscountPercent())
            .images(p.getImages())
            .category(p.getCategory())
            .subCategory(p.getSubCategory())
            .brand(p.getBrand())
            .variants(variants)
            .specifications(p.getSpecifications())
            .tags(p.getTags())
            .stock(p.getStock())
            .sku(p.getSku())
            .rating(p.getRating())
            .reviewCount(p.getReviewCount())
            .active(p.isActive())
            .featured(p.isFeatured())
            .createdAt(p.getCreatedAt())
            .build();
    }
}
