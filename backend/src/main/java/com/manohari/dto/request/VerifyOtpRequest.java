package com.manohari.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import lombok.Data;
@Data
public class VerifyOtpRequest {
    @NotBlank @Email private String email;
    @NotBlank private String otp;
}
