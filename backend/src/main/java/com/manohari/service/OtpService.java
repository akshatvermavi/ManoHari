package com.manohari.service;
public interface OtpService {
    String generateAndStoreOtp(String key);
    boolean verifyOtp(String key, String otp);
    void invalidateOtp(String key);
}
