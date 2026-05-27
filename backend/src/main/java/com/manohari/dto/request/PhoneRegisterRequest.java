package com.manohari.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PhoneRegisterRequest {
    @NotBlank
    private String name;

    @NotBlank @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    private String phoneNumber;

    @NotBlank
    private String password;
}
