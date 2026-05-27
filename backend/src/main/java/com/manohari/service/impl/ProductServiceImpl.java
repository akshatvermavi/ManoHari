package com.manohari.service.impl;

import com.manohari.dto.response.PageResponse;
import com.manohari.dto.response.ProductResponse;
import com.manohari.exception.ResourceNotFoundException;
import com.manohari.model.Product;
import com.manohari.repository.ProductRepository;
import com.manohari.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public PageResponse<ProductResponse> getProducts(Pageable pageable, String category,
                                                      String brand, Double minPrice, Double maxPrice) {
        Query query = new Query().with(pageable);
        Criteria criteria = Criteria.where("active").is(true);

        if (category != null && !category.isBlank())
            criteria = criteria.and("category").regex(category, "i");
        if (brand != null && !brand.isBlank())
            criteria = criteria.and("brand").regex(brand, "i");
        if (minPrice != null)
            criteria = criteria.and("price").gte(BigDecimal.valueOf(minPrice));
        if (maxPrice != null)
            criteria = criteria.and("price").lte(BigDecimal.valueOf(maxPrice));

        query.addCriteria(criteria);
        List<Product> products = mongoTemplate.find(query, Product.class);
        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Product.class);

        Page<Product> page = PageableExecutionUtils.getPage(products, pageable, () -> total);
        return buildPageResponse(page);
    }

    @Override
    public ProductResponse getProductById(String id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Override
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue()
            .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getNewArrivals() {
        return productRepository.findTop10ByActiveTrueOrderByCreatedAtDesc()
            .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public PageResponse<ProductResponse> getProductsByCategory(String category, Pageable pageable) {
        Page<Product> page = productRepository.findByCategoryAndActiveTrue(category, pageable);
        return buildPageResponse(page);
    }

    private PageResponse<ProductResponse> buildPageResponse(Page<Product> page) {
        List<ProductResponse> content = page.getContent().stream()
            .map(this::mapToResponse).collect(Collectors.toList());
        return PageResponse.<ProductResponse>builder()
            .content(content).page(page.getNumber()).size(page.getSize())
            .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
            .last(page.isLast()).build();
    }

    public ProductResponse mapToResponse(Product p) {
        List<ProductResponse.VariantResponse> variants = null;
        if (p.getVariants() != null) {
            variants = p.getVariants().stream()
                .map(v -> ProductResponse.VariantResponse.builder()
                    .color(v.getColor()).colorHex(v.getColorHex())
                    .sizes(v.getSizes()).variantImages(v.getVariantImages())
                    .stock(v.getStock()).build())
                .collect(Collectors.toList());
        }
        return ProductResponse.builder()
            .id(p.getId()).title(p.getTitle()).description(p.getDescription())
            .price(p.getPrice()).discountedPrice(p.getDiscountedPrice())
            .discountPercent(p.getDiscountPercent()).images(p.getImages())
            .category(p.getCategory()).subCategory(p.getSubCategory()).brand(p.getBrand())
            .variants(variants).specifications(p.getSpecifications()).tags(p.getTags())
            .stock(p.getStock()).sku(p.getSku()).rating(p.getRating())
            .reviewCount(p.getReviewCount()).active(p.isActive()).featured(p.isFeatured())
            .createdAt(p.getCreatedAt()).build();
    }
}
