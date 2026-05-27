package com.manohari.security.oauth2;

import com.manohari.model.User;
import com.manohari.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        String googleId = (String) attributes.get("sub");

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            user.setName(name);
            user.setProfileImage(picture);
            if (user.getAuthProvider() == User.AuthProvider.LOCAL) {
                user.setAuthProvider(User.AuthProvider.GOOGLE);
                user.setProviderId(googleId);
            }
        } else {
            user = User.builder()
                .email(email)
                .name(name)
                .profileImage(picture)
                .authProvider(User.AuthProvider.GOOGLE)
                .providerId(googleId)
                .emailVerified(true)
                .role(User.Role.USER)
                .build();
        }

        userRepository.save(user);
        return new CustomOAuth2User(oAuth2User, user);
    }
}
