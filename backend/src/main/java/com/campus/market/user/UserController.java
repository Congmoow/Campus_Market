package com.campus.market.user;

import com.campus.market.common.api.ApiResponse;
import com.campus.market.common.exception.BusinessException;
import com.campus.market.product.ProductService;
import com.campus.market.product.dto.ProductListItemDto;
import com.campus.market.user.dto.UpdateProfileRequest;
import com.campus.market.user.dto.UserProfileDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * 用户相关接口控制器。
 *
 * 提供能力：
 * - 获取当前登录用户资料 / 指定用户资料
 * - 更新当前用户资料
 * - 查询某个用户的在售 / 已售商品列表
 */
@RestController
public class UserController {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final ProductService productService;

    public UserController(UserRepository userRepository,
                          UserProfileRepository userProfileRepository,
                          ProductService productService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.productService = productService;
    }

    @GetMapping("/api/users/me")
    public ApiResponse<UserProfileDto> me(Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return ApiResponse.ok(buildProfileDto(user));
    }

    @GetMapping("/api/users/{id}")
    public ApiResponse<UserProfileDto> getUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return ApiResponse.ok(buildProfileDto(user));
    }

    @PutMapping("/api/users/me")
    public ApiResponse<UserProfileDto> updateProfile(@RequestBody UpdateProfileRequest request, Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));

        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        boolean isNew = false;
        if (profile == null) {
            profile = new UserProfile();
            profile.setUserId(user.getId());
            profile.setNickname(user.getUsername());
            isNew = true;
        }

        if (request.getNickname() != null && !request.getNickname().isBlank()) {
            profile.setNickname(request.getNickname());
        }
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getMajor() != null) {
            profile.setMajor(request.getMajor());
        }
        if (request.getGrade() != null) {
            profile.setGrade(request.getGrade());
        }
        if (request.getCampus() != null) {
            profile.setCampus(request.getCampus());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        if (isNew) {
            profile.prePersist();
            userProfileRepository.insert(profile);
        } else {
            profile.preUpdate();
            userProfileRepository.update(profile);
        }

        return ApiResponse.ok(buildProfileDto(user));
    }

    @GetMapping("/api/users/me/products")
    public ApiResponse<Page<ProductListItemDto>> myProducts(@RequestParam(required = false) String status,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "20") int size,
                                                            Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
        Page<ProductListItemDto> result = productService.listBySeller(user.getId(), status, page, size);
        return ApiResponse.ok(result);
    }

    @GetMapping("/api/users/{id}/products")
    public ApiResponse<Page<ProductListItemDto>> userProducts(@PathVariable Long id,
                                                              @RequestParam(required = false) String status,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "20") int size) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        Page<ProductListItemDto> result = productService.listBySeller(user.getId(), status, page, size);
        return ApiResponse.ok(result);
    }

    private UserProfileDto buildProfileDto(User user) {
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        if (profile != null) {
            dto.setNickname(profile.getNickname());
            dto.setAvatarUrl(profile.getAvatarUrl());
            dto.setMajor(profile.getMajor());
            dto.setGrade(profile.getGrade());
            dto.setCampus(profile.getCampus());
            dto.setCredit(profile.getCredit());
            dto.setBio(profile.getBio());
            dto.setJoinAt(profile.getCreatedAt());
        } else {
            dto.setNickname(user.getUsername());
        }
        // 简单统计：在售/已售数量
        long sellingCount = productService.listBySeller(user.getId(), "ON_SALE", 0, 1).getTotalElements();
        long soldCount = productService.listBySeller(user.getId(), "SOLD", 0, 1).getTotalElements();
        dto.setSellingCount(sellingCount);
        dto.setSoldCount(soldCount);
        return dto;
    }
}
