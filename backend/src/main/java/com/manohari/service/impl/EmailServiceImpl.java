package com.manohari.service.impl;

import com.manohari.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    @Override
    public void sendOtp(String to, String name, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "ManoHari");
            helper.setTo(to);
            helper.setSubject("Your ManoHari OTP: " + otp);
            helper.setText(buildOtpEmailHtml(name, otp), true);
            mailSender.send(message);
            log.info("OTP email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    @Override
    public void sendPasswordResetOtp(String to, String name, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "ManoHari");
            helper.setTo(to);
            helper.setSubject("Reset Your ManoHari Password");
            helper.setText(buildPasswordResetHtml(name, otp), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send password reset email: {}", e.getMessage());
        }
    }

    @Async
    @Override
    public void sendOrderConfirmation(String to, String name, String orderNumber) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "ManoHari");
            helper.setTo(to);
            helper.setSubject("Order Confirmed! #" + orderNumber);
            helper.setText(buildOrderConfirmHtml(name, orderNumber), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email: {}", e.getMessage());
        }
    }

    @Async
    @Override
    public void sendOrderStatusUpdate(String to, String name, String orderNumber, String status) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "ManoHari");
            helper.setTo(to);
            helper.setSubject("Order #" + orderNumber + " Update - " + status);
            helper.setText(buildOrderUpdateHtml(name, orderNumber, status), true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send order update email: {}", e.getMessage());
        }
    }

    private String buildOtpEmailHtml(String name, String otp) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
              <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:24px;text-align:center">
                <h1 style="color:#e2c27d;margin:0;font-size:28px">ManoHari</h1>
              </div>
              <div style="padding:32px">
                <h2 style="color:#1a1a2e">Hello %s 👋</h2>
                <p style="color:#4a5568">Your verification OTP is:</p>
                <div style="background:#f7fafc;border:2px dashed #e2c27d;border-radius:8px;padding:16px;text-align:center;margin:16px 0">
                  <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a1a2e">%s</span>
                </div>
                <p style="color:#718096;font-size:14px">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
              </div>
            </div>
            """.formatted(name, otp);
    }

    private String buildPasswordResetHtml(String name, String otp) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
              <h2>Hi %s, reset your password</h2>
              <p>Your password reset OTP: <strong style="font-size:24px">%s</strong></p>
              <p>Expires in 10 minutes.</p>
            </div>
            """.formatted(name, otp);
    }

    private String buildOrderConfirmHtml(String name, String orderNumber) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
              <h2>🎉 Order Confirmed!</h2>
              <p>Hi %s, your order <strong>#%s</strong> has been confirmed.</p>
              <p>We'll notify you when it ships!</p>
            </div>
            """.formatted(name, orderNumber);
    }

    private String buildOrderUpdateHtml(String name, String orderNumber, String status) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
              <h2>Order Update</h2>
              <p>Hi %s, your order <strong>#%s</strong> is now <strong>%s</strong>.</p>
            </div>
            """.formatted(name, orderNumber, status);
    }
}
