package com.manohari.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    @Indexed
    private String productId;

    @Indexed
    private String userId;

    private String userName;

    private String userImage;

    private int rating;

    private String title;

    private String comment;

    private List<String> images;

    @Builder.Default
    private boolean verified = false;

    @CreatedDate
    private LocalDateTime createdAt;
}
