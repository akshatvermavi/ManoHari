package com.manohari.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.manohari.dto.request.AddAddressRequest;
import com.manohari.dto.request.UpdateProfileRequest;
import com.manohari.dto.response.UserResponse;
import com.manohari.exception.BadRequestException;
import com.manohari.exception.ResourceNotFoundException;
import com.manohari.model.User;
import com.manohari.repository.UserRepository;
import com.manohari.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final Cloudinary cloudinary;

    @Override
    public UserResponse getProfile(String identifier) {
        User user = getUser(identifier);
        return mapToResponse(user);
    }

    @Override
    public UserResponse updateProfile(String identifier, UpdateProfileRequest request) {
        User user = getUser(identifier);
        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail()))
                throw new BadRequestException("Email already in use");
            user.setEmail(request.getEmail());
            user.setEmailVerified(false);
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(user.getPhoneNumber())) {
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber()))
                throw new BadRequestException("Phone number already in use");
            user.setPhoneNumber(request.getPhoneNumber());
            user.setPhoneVerified(false);
        }
        userRepository.save(user);
        return mapToResponse(user);
    }

    @Override
    public String updateAvatar(String identifier, MultipartFile file) {
        User user = getUser(identifier);
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("folder", "manohari/avatars",
                    "public_id", "avatar_" + user.getId()));
            String imageUrl = (String) result.get("secure_url");
            user.setProfileImage(imageUrl);
            userRepository.save(user);
            return imageUrl;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image");
        }
    }

    @Override
    public List<User.Address> getAddresses(String identifier) {
        return getUser(identifier).getAddresses();
    }

    @Override
    public List<User.Address> addAddress(String identifier, AddAddressRequest request) {
        User user = getUser(identifier);
        if (user.getAddresses() == null) user.setAddresses(new ArrayList<>());

        User.Address address = User.Address.builder()
            .id(UUID.randomUUID().toString())
            .fullName(request.getFullName())
            .phone(request.getPhone())
            .addressLine1(request.getAddressLine1())
            .addressLine2(request.getAddressLine2())
            .city(request.getCity())
            .state(request.getState())
            .pincode(request.getPincode())
            .country(request.getCountry() != null ? request.getCountry() : "India")
            .isDefault(request.isDefault())
            .build();

        if (request.isDefault()) {
            user.getAddresses().forEach(a -> a.setDefault(false));
        }
        if (user.getAddresses().isEmpty()) address.setDefault(true);

        user.getAddresses().add(address);
        userRepository.save(user);
        return user.getAddresses();
    }

    @Override
    public List<User.Address> updateAddress(String identifier, String addressId, AddAddressRequest request) {
        User user = getUser(identifier);
        user.getAddresses().stream()
            .filter(a -> a.getId().equals(addressId))
            .findFirst()
            .ifPresentOrElse(addr -> {
                addr.setFullName(request.getFullName());
                addr.setPhone(request.getPhone());
                addr.setAddressLine1(request.getAddressLine1());
                addr.setAddressLine2(request.getAddressLine2());
                addr.setCity(request.getCity());
                addr.setState(request.getState());
                addr.setPincode(request.getPincode());
                if (request.isDefault()) {
                    user.getAddresses().forEach(a -> a.setDefault(false));
                    addr.setDefault(true);
                }
            }, () -> { throw new ResourceNotFoundException("Address not found"); });
        userRepository.save(user);
        return user.getAddresses();
    }

    @Override
    public List<User.Address> deleteAddress(String identifier, String addressId) {
        User user = getUser(identifier);
        user.getAddresses().removeIf(a -> a.getId().equals(addressId));
        userRepository.save(user);
        return user.getAddresses();
    }

    private User getUser(String identifier) {
        return userRepository.findByEmail(identifier)
            .or(() -> userRepository.findByPhoneNumber(identifier))
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
            .id(user.getId()).name(user.getName()).email(user.getEmail())
            .phoneNumber(user.getPhoneNumber()).profileImage(user.getProfileImage())
            .role(user.getRole()).emailVerified(user.isEmailVerified())
            .phoneVerified(user.isPhoneVerified()).active(user.isActive())
            .addresses(user.getAddresses()).createdAt(user.getCreatedAt()).build();
    }
}
