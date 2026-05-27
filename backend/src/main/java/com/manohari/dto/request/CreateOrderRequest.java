package com.manohari.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class CreateOrderRequest {
    @NotBlank private String addressId;
    private String notes;
}
