package com.manohari.service.impl;

import com.manohari.dto.request.*;
import com.manohari.dto.response.AuthResponse;
import com.manohari.dto.response.UserResponse;
import com.manohari.exception.BadRequestException;
import com.manohari.exception.ResourceNotFoundException;
import com.manohari.model.User;
import com.manohari.repository.UserRepository;
import com.manohari.security.jwt.JwtUtil;
import com.manohari.service.AuthService;
import com.manohari.service.EmailService;
import com.manohari.service.OtpService;
import com.manohari.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;
    private final EmailService emailService;
    private final SmsService smsService;

    @Override
    public void registerWithEmail(EmailRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        // Save user as unverified
        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .emailVerified(false)
            .role(User.Role.USER)
            .build();
        userRepository.save(user);

        // Generate and send OTP
        String otp = otpService.generateAndStoreOtp("email:" + request.getEmail());
        emailService.sendOtp(request.getEmail(), request.getName(), otp);
    }

    @Override
    public AuthResponse verifyEmailOtp(VerifyOtpRequest request) {
        boolean valid = otpService.verifyOtp("email:" + request.getEmail(), request.getOtp());
        if (!valid) throw new BadRequestException("Invalid or expired OTP");

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEmailVerified(true);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Override
    public void registerWithPhone(PhoneRegisterRequest request) {
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BadRequestException("Phone number already registered");
        }
        User user = User.builder()
            .name(request.getName())
            .phoneNumber(request.getPhoneNumber())
            .password(passwordEncoder.encode(request.getPassword()))
            .phoneVerified(false)
            .role(User.Role.USER)
            .build();
        userRepository.save(user);

        String otp = otpService.generateAndStoreOtp("phone:" + request.getPhoneNumber());
        smsService.sendOtp(request.getPhoneNumber(), otp);
    }

    @Override
    public AuthResponse verifyPhoneOtp(VerifyPhoneOtpRequest request) {
        boolean valid = otpService.verifyOtp("phone:" + request.getPhoneNumber(), request.getOtp());
        if (!valid) throw new BadRequestException("Invalid or expired OTP");

        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPhoneVerified(true);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getIdentifier(), request.getPassword())
            );
        } catch (Exception e) {
            throw new BadRequestException("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.getIdentifier())
            .or(() -> userRepository.findByPhoneNumber(request.getIdentifier()))
            .orElseThrow(() -> new BadRequestException("User not found"));

        return buildAuthResponse(user);
    }

    @Override
    public void sendPhoneLoginOtp(String phoneNumber) {
        if (!userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new ResourceNotFoundException("No account found with this number");
        }
        String otp = otpService.generateAndStoreOtp("login:" + phoneNumber);
        smsService.sendOtp(phoneNumber, otp);
    }

    @Override
    public AuthResponse loginWithPhoneOtp(VerifyPhoneOtpRequest request) {
        boolean valid = otpService.verifyOtp("login:" + request.getPhoneNumber(), request.getOtp());
        if (!valid) throw new BadRequestException("Invalid or expired OTP");

        User user = userRepository.findByPhoneNumber(request.getPhoneNumber())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildAuthResponse(user);
    }

    @Override
    public void sendPasswordResetOtp(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("No account found with this email"));
        String otp = otpService.generateAndStoreOtp("reset:" + email);
        emailService.sendPasswordResetOtp(email, user.getName(), otp);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        boolean valid = otpService.verifyOtp("reset:" + request.getIdentifier(), request.getOtp());
        if (!valid) throw new BadRequestException("Invalid or expired OTP");

        User user = userRepository.findByEmail(request.getIdentifier())
            .or(() -> userRepository.findByPhoneNumber(request.getIdentifier()))
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        String username = jwtUtil.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (!jwtUtil.isTokenValid(refreshToken, userDetails)) {
            throw new BadRequestException("Invalid refresh token");
        }
        User user = userRepository.findByEmail(username)
            .or(() -> userRepository.findByPhoneNumber(username))
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return buildAuthResponse(user);
    }

    @Override
    public void resendOtp(String identifier, String type) {
        String key = type + ":" + identifier;
        String otp = otpService.generateAndStoreOtp(key);
        if (identifier.contains("@")) {
            User user = userRepository.findByEmail(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            emailService.sendOtp(identifier, user.getName(), otp);
        } else {
            smsService.sendOtp(identifier, otp);
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        String identifier = user.getEmail() != null ? user.getEmail() : user.getPhoneNumber();
        UserDetails userDetails = userDetailsService.loadUserByUsername(identifier);
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .user(UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .profileImage(user.getProfileImage())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .phoneVerified(user.isPhoneVerified())
                .addresses(user.getAddresses())
                .createdAt(user.getCreatedAt())
                .build())
            .build();
    }
}
