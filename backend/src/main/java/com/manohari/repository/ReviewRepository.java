//package com.manohari.repository;
//
//import com.manohari.model.Review;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.mongodb.repository.MongoRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.Optional;
//
//@Repository
//public interface ReviewRepository extends MongoRepository<Review, String> {
//    Page<Review> findByProductId(String productId, Pageable pageable);
//    Optional<Review> findByProductIdAndUserId(String productId, String userId);
//    boolean existsByProductIdAndUserId(String productId, String userId);
//    double avgRatingByProductId(String productId);
//}


package com.manohari.repository;

import com.manohari.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {

    Page<Review> findByProductId(String productId, Pageable pageable);

    Optional<Review> findByProductIdAndUserId(String productId, String userId);

    boolean existsByProductIdAndUserId(String productId, String userId);

    @Aggregation(pipeline = {
            "{ '$match': { 'productId': ?0 } }",
            "{ '$group': { '_id': null, 'avgRating': { '$avg': '$rating' } } }"
    })
    Double getAverageRatingByProductId(String productId);
}