package com.manohari.service.impl;

import com.manohari.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final StringRedisTemplate redisTemplate;

    @Value("${app.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${app.otp.length:6}")
    private int otpLength;

    private static final SecureRandom random = new SecureRandom();

    @Override
    public String generateAndStoreOtp(String key) {
        String otp = generateOtp();
        String redisKey = "otp:" + key;
        redisTemplate.opsForValue().set(redisKey, otp, Duration.ofMinutes(otpExpiryMinutes));
        log.info("OTP generated for key: {} (expires in {} min)", key, otpExpiryMinutes);
        return otp;
    }

    @Override
    public boolean verifyOtp(String key, String otp) {
        String redisKey = "otp:" + key;
        String storedOtp = redisTemplate.opsForValue().get(redisKey);
        if (storedOtp != null && storedOtp.equals(otp)) {
            redisTemplate.delete(redisKey); // one-time use
            return true;
        }
        return false;
    }

    @Override
    public void invalidateOtp(String key) {
        redisTemplate.delete("otp:" + key);
    }

    private String generateOtp() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
