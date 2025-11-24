package com.campus.market.auth;

import com.campus.market.auth.dto.AuthResponse;
import com.campus.market.auth.dto.LoginRequest;
import com.campus.market.auth.dto.RegisterRequest;
import com.campus.market.common.api.ApiResponse;
import com.campus.market.common.exception.BusinessException;
import com.campus.market.user.User;
import com.campus.market.user.UserProfile;
import com.campus.market.user.UserProfileRepository;
import com.campus.market.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(UserRepository userRepository,
                          UserProfileRepository userProfileRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        userRepository.findByUsername(request.getUsername()).ifPresent(u -> {
            throw new BusinessException("该学号已注册");
        });
        if (request.getPhone() != null) {
            userRepository.findByPhone(request.getPhone()).ifPresent(u -> {
                throw new BusinessException("该手机号已注册");
            });
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUserId(user.getId());
        profile.setNickname(request.getNickname());
        userProfileRepository.save(profile);

        String token = jwtTokenProvider.createToken(user.getId(), user.getUsername(), user.getRole());
        AuthResponse resp = new AuthResponse(token, user.getId(), user.getUsername(), profile.getNickname());
        return ApiResponse.ok(resp);
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // 允许用 username 或 phone 登录
        String username = request.getUsernameOrPhone();
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new BusinessException("账号或密码错误"));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        String nickname = profile != null ? profile.getNickname() : user.getUsername();

        String token = jwtTokenProvider.createToken(user.getId(), user.getUsername(), user.getRole());
        AuthResponse resp = new AuthResponse(token, user.getId(), user.getUsername(), nickname);
        return ApiResponse.ok(resp);
    }

    @GetMapping("/me")
    public ApiResponse<AuthResponse> me(Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        String nickname = profile != null ? profile.getNickname() : user.getUsername();
        String token = null; // 不重新签发 token，只返回用户信息
        AuthResponse resp = new AuthResponse(token, user.getId(), user.getUsername(), nickname);
        return ApiResponse.ok(resp);
    }
}
