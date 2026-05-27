package com.manohari.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class ResetPasswordRequest {
    @NotBlank private String identifier;
    @NotBlank private String otp;
    @NotBlank private String newPassword;
}
