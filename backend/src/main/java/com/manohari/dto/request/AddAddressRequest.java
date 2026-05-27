package com.manohari.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class AddAddressRequest {
    @NotBlank private String fullName;
    @NotBlank private String phone;
    @NotBlank private String addressLine1;
    private String addressLine2;
    @NotBlank private String city;
    @NotBlank private String state;
    @NotBlank private String pincode;
    private String country = "India";
    private boolean isDefault = false;
}
