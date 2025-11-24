package com.campus.market.favorite;

import com.campus.market.common.api.ApiResponse;
import com.campus.market.common.exception.BusinessException;
import com.campus.market.product.dto.ProductListItemDto;
import com.campus.market.user.User;
import com.campus.market.user.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserRepository userRepository;

    public FavoriteController(FavoriteService favoriteService, UserRepository userRepository) {
        this.favoriteService = favoriteService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ApiResponse<List<ProductListItemDto>> listMyFavorites(Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
        List<ProductListItemDto> list = favoriteService.listMyFavorites(user.getId());
        return ApiResponse.ok(list);
    }

    @PostMapping("/{productId}")
    public ApiResponse<Void> addFavorite(@PathVariable Long productId, Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
        favoriteService.addFavorite(user.getId(), productId);
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/{productId}")
    public ApiResponse<Void> removeFavorite(@PathVariable Long productId, Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
        favoriteService.removeFavorite(user.getId(), productId);
        return ApiResponse.ok(null);
    }
}
