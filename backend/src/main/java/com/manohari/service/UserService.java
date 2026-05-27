package com.manohari.service;
import com.manohari.dto.request.AddAddressRequest;
import com.manohari.dto.request.UpdateProfileRequest;
import com.manohari.dto.response.UserResponse;
import com.manohari.model.User;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
public interface UserService {
    UserResponse getProfile(String identifier);
    UserResponse updateProfile(String identifier, UpdateProfileRequest request);
    String updateAvatar(String identifier, MultipartFile file);
    List<User.Address> getAddresses(String identifier);
    List<User.Address> addAddress(String identifier, AddAddressRequest request);
    List<User.Address> updateAddress(String identifier, String addressId, AddAddressRequest request);
    List<User.Address> deleteAddress(String identifier, String addressId);
}
