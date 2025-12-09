package com.campus.market.auth;

import com.campus.market.auth.dto.AuthResponse;
import com.campus.market.auth.dto.LoginRequest;
import com.campus.market.auth.dto.RegisterRequest;
import com.campus.market.auth.dto.ResetPasswordRequest;
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

/**
 * 认证相关接口控制器。
 *
 * 提供以下能力：
 * - 用户注册
 * - 用户登录
 * - 查询当前登录用户信息
 * - 忘记密码重置密码
 */
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
        // 校验学号是否已注册
        userRepository.findByUsername(request.getUsername()).ifPresent(u -> {
            throw new BusinessException("该学号已注册");
        });
        if (request.getPhone() != null) {
            // 校验手机号是否已被其它账号使用
            userRepository.findByPhone(request.getPhone()).ifPresent(u -> {
                throw new BusinessException("该手机号已注册");
            });
        }

        // 创建用户主表记录
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.prePersist();
        userRepository.insert(user);

        // 创建用户扩展资料（只存放昵称等展示信息）
        UserProfile profile = new UserProfile();
        profile.setUserId(user.getId());
        profile.setNickname(request.getNickname());
        profile.prePersist();
        userProfileRepository.insert(profile);

        // 注册成功后直接签发登录 token，前端可视为自动登录
        String token = jwtTokenProvider.createToken(user.getId(), user.getUsername(), user.getRole());
        AuthResponse resp = new AuthResponse(token, user.getId(), user.getUsername(), profile.getNickname());
        return ApiResponse.ok(resp);
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // 允许用学号(username) 或 手机号(phone) 作为登录账号
        String username = request.getUsernameOrPhone();
        // 先根据学号查找，不存在再按手机号查找
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new BusinessException("账号或密码错误"));

        // 将用户名和密码交给 Spring Security 统一做密码校验与认证
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 读取用户昵称（若无资料则退回用户名）
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        String nickname = profile != null ? profile.getNickname() : user.getUsername();

        // 签发 JWT token，包含用户 ID / 学号 / 角色
        String token = jwtTokenProvider.createToken(user.getId(), user.getUsername(), user.getRole());
        AuthResponse resp = new AuthResponse(token, user.getId(), user.getUsername(), nickname);
        return ApiResponse.ok(resp);
    }

    @GetMapping("/me")
    public ApiResponse<AuthResponse> me(Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        // 从 Spring Security 的 Principal 中拿到当前登录用户名，再查询用户与资料
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        String nickname = profile != null ? profile.getNickname() : user.getUsername();
        String token = null; // 不重新签发 token，只返回用户信息
        AuthResponse resp = new AuthResponse(token, user.getId(), user.getUsername(), nickname);
        return ApiResponse.ok(resp);
    }

    /**
     * 忘记密码 - 通过学号+手机号验证身份后重置密码
     */
    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        // 1. 根据学号查找用户
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("该学号未注册"));

        // 2. 验证手机号是否匹配
        if (user.getPhone() == null || !user.getPhone().equals(request.getPhone())) {
            throw new BusinessException("手机号与注册时不匹配");
        }

        // 3. 更新密码
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.preUpdate();
        userRepository.updateById(user);

        return ApiResponse.ok("密码重置成功");
    }
}
