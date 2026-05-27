package com.manohari.config;

import com.manohari.model.User;
import com.manohari.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail(adminEmail)) {
            User superAdmin = User.builder()
                .name("Vakshat")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(User.Role.SUPER_ADMIN)
                .emailVerified(true)
                .active(true)
                .build();
            userRepository.save(superAdmin);
            log.info("✅ Super admin created: {}", adminEmail);
        } else {
            log.info("ℹ️  Super admin already exists: {}", adminEmail);
        }
    }
}
