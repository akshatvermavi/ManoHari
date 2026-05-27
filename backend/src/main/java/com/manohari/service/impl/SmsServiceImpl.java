package com.manohari.service.impl;

import com.manohari.service.SmsService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SmsServiceImpl implements SmsService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromPhone;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    @Override
    public void sendOtp(String phoneNumber, String otp) {
        try {
            // Add +91 for India if not present
            String toPhone = phoneNumber.startsWith("+") ? phoneNumber : "+91" + phoneNumber;
            Message message = Message.creator(
                new PhoneNumber(toPhone),
                new PhoneNumber(fromPhone),
                "Your ManoHari OTP is: " + otp + ". Valid for 10 minutes. Do not share."
            ).create();
            log.info("SMS sent to {} with SID: {}", phoneNumber, message.getSid());
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage());
            // Don't throw - log and continue (dev mode)
        }
    }
}
