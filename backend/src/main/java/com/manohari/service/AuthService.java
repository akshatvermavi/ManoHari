package com.manohari.service;

import com.manohari.dto.request.*;
import com.manohari.dto.response.AuthResponse;

public interface AuthService {
    void registerWithEmail(EmailRegisterRequest request);
    AuthResponse verifyEmailOtp(VerifyOtpRequest request);
    void registerWithPhone(PhoneRegisterRequest request);
    AuthResponse verifyPhoneOtp(VerifyPhoneOtpRequest request);
    AuthResponse login(LoginRequest request);
    void sendPhoneLoginOtp(String phoneNumber);
    AuthResponse loginWithPhoneOtp(VerifyPhoneOtpRequest request);
    void sendPasswordResetOtp(String email);
    void resetPassword(ResetPasswordRequest request);
    AuthResponse refreshToken(String refreshToken);
    void resendOtp(String identifier, String type);
}
