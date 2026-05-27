package com.manohari.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class VerifyPhoneOtpRequest {
    @NotBlank private String phoneNumber;
    @NotBlank private String otp;
}
