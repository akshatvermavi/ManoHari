package com.manohari.controller;

import com.manohari.dto.request.*;
import com.manohari.dto.response.ApiResponse;
import com.manohari.dto.response.AuthResponse;
import com.manohari.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ───── Email Registration ─────
    @PostMapping("/register/email")
    public ResponseEntity<ApiResponse<String>> registerWithEmail(@Valid @RequestBody EmailRegisterRequest request) {
        authService.registerWithEmail(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to " + request.getEmail() + ". Please verify."));
    }

    @PostMapping("/verify/email-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyEmailOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyEmailOtp(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ───── Phone Registration ─────
    @PostMapping("/register/phone")
    public ResponseEntity<ApiResponse<String>> registerWithPhone(@Valid @RequestBody PhoneRegisterRequest request) {
        authService.registerWithPhone(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to " + request.getPhoneNumber()));
    }

    @PostMapping("/verify/phone-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyPhoneOtp(@Valid @RequestBody VerifyPhoneOtpRequest request) {
        AuthResponse response = authService.verifyPhoneOtp(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ───── Login ─────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ───── Send OTP for Login (phone) ─────
    @PostMapping("/send-otp/phone")
    public ResponseEntity<ApiResponse<String>> sendPhoneLoginOtp(@RequestParam String phoneNumber) {
        authService.sendPhoneLoginOtp(phoneNumber);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to " + phoneNumber));
    }

    @PostMapping("/login/phone-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithPhoneOtp(@Valid @RequestBody VerifyPhoneOtpRequest request) {
        AuthResponse response = authService.loginWithPhoneOtp(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ───── Forgot Password ─────
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestParam String email) {
        authService.sendPasswordResetOtp(email);
        return ResponseEntity.ok(ApiResponse.success("Password reset OTP sent to " + email));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }

    // ───── Token Refresh ─────
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestParam String refreshToken) {
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ───── Resend OTP ─────
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(@RequestParam String identifier,
                                                          @RequestParam String type) {
        authService.resendOtp(identifier, type);
        return ResponseEntity.ok(ApiResponse.success("OTP resent successfully"));
    }
}
