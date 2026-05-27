package com.manohari.service;
public interface EmailService {
    void sendOtp(String to, String name, String otp);
    void sendPasswordResetOtp(String to, String name, String otp);
    void sendOrderConfirmation(String to, String name, String orderNumber);
    void sendOrderStatusUpdate(String to, String name, String orderNumber, String status);
}
