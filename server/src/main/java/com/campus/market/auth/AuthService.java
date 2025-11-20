package com.campus.market.auth;

import com.campus.market.users.User;
import com.campus.market.users.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public record AuthResponse(String token, Object user) {}

    public AuthResponse login(String username, String rawPassword) {
        Optional<User> byEmail = userRepository.findByEmail(username);
        Optional<User> byPhone = userRepository.findByPhone(username);
        Optional<User> byNickname = userRepository.findByNickname(username);
        User user = byEmail.or(() -> byPhone).or(() -> byNickname).orElseThrow(() -> new RuntimeException("用户不存在"));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new RuntimeException("密码错误");
        }

        String token = jwtService.generateToken(String.valueOf(user.getId()), java.util.Map.of("role", user.getRole()));
        java.util.Map<String, Object> userMap = new java.util.LinkedHashMap<>();
        userMap.put("id", user.getId());
        if (user.getEmail() != null) userMap.put("email", user.getEmail());
        if (user.getPhone() != null) userMap.put("phone", user.getPhone());
        if (user.getNickname() != null) userMap.put("nickname", user.getNickname());
        if (user.getRole() != null) userMap.put("role", user.getRole());
        if (user.getStatus() != null) userMap.put("status", user.getStatus());
        if (user.getCampus() != null) userMap.put("campus", user.getCampus());
        if (user.getCreatedAt() != null) {
            userMap.put("createdAt", user.getCreatedAt().toString());
        }
        return new AuthResponse(token, userMap);
    }

    public AuthResponse register(String email, String nickname, String rawPassword, String phone, String campus) {
        userRepository.findByEmail(email).ifPresent(u -> { throw new RuntimeException("邮箱已存在"); });
        User user = new User();
        user.setEmail(email);
        user.setNickname(nickname);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        if (phone != null && !phone.isBlank()) user.setPhone(phone);
        if (campus != null && !campus.isBlank()) user.setCampus(campus);
        user.setRole("STUDENT");
        user.setStatus("ACTIVE");
        java.time.Instant now = java.time.Instant.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        userRepository.save(user);

        String token = jwtService.generateToken(String.valueOf(user.getId()), java.util.Map.of("role", user.getRole()));
        java.util.Map<String, Object> userMap = new java.util.LinkedHashMap<>();
        userMap.put("id", user.getId());
        if (user.getEmail() != null) userMap.put("email", user.getEmail());
        if (user.getNickname() != null) userMap.put("nickname", user.getNickname());
        if (user.getPhone() != null) userMap.put("phone", user.getPhone());
        if (user.getCampus() != null) userMap.put("campus", user.getCampus());
        if (user.getRole() != null) userMap.put("role", user.getRole());
        if (user.getStatus() != null) userMap.put("status", user.getStatus());
        if (user.getCreatedAt() != null) {
            userMap.put("createdAt", user.getCreatedAt().toString());
        }
        return new AuthResponse(token, userMap);
    }
}


