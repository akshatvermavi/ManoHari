package com.manohari.controller;

import com.manohari.dto.request.UpdateProfileRequest;
import com.manohari.dto.request.AddAddressRequest;
import com.manohari.dto.response.ApiResponse;
import com.manohari.dto.response.UserResponse;
import com.manohari.model.User;
import com.manohari.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UserResponse user = userService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse user = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<ApiResponse<String>> updateAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        String imageUrl = userService.updateAvatar(userDetails.getUsername(), file);
        return ResponseEntity.ok(ApiResponse.success(imageUrl));
    }

    @GetMapping("/me/addresses")
    public ResponseEntity<ApiResponse<List<User.Address>>> getAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        List<User.Address> addresses = userService.getAddresses(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<ApiResponse<List<User.Address>>> addAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddAddressRequest request) {
        List<User.Address> addresses = userService.addAddress(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PutMapping("/me/addresses/{addressId}")
    public ResponseEntity<ApiResponse<List<User.Address>>> updateAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String addressId,
            @Valid @RequestBody AddAddressRequest request) {
        List<User.Address> addresses = userService.updateAddress(userDetails.getUsername(), addressId, request);
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @DeleteMapping("/me/addresses/{addressId}")
    public ResponseEntity<ApiResponse<List<User.Address>>> deleteAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String addressId) {
        List<User.Address> addresses = userService.deleteAddress(userDetails.getUsername(), addressId);
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }
}
