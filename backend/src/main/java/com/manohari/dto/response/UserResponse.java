package com.manohari.dto.response;
import com.manohari.model.User;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String phoneNumber;
    private String profileImage;
    private User.Role role;
    private boolean emailVerified;
    private boolean phoneVerified;
    private boolean active;
    private List<User.Address> addresses;
    private LocalDateTime createdAt;
}
