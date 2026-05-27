package com.manohari.repository;

import com.manohari.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryAndActiveTrue(String category, Pageable pageable);

    Page<Product> findByBrandAndActiveTrue(String brand, Pageable pageable);

    List<Product> findByFeaturedTrueAndActiveTrue();

    @Query("{ 'title': { $regex: ?0, $options: 'i' }, 'active': true }")
    List<Product> findByTitleContainingIgnoreCaseAndActiveTrue(String title);

    @Query("{ $text: { $search: ?0 }, 'active': true }")
    Page<Product> fullTextSearch(String searchTerm, Pageable pageable);

    @Query("{ 'title': { $regex: ?0, $options: 'i' }, 'active': true }")
    List<Product> findSuggestions(String query, Pageable pageable);

    long countByActiveTrue();

    long countByCategoryAndActiveTrue(String category);

    List<Product> findTop10ByActiveTrueOrderByCreatedAtDesc();
}
