package com.campus.market.product;

import com.campus.market.common.api.ApiResponse;
import com.campus.market.product.dto.CategoryDto;
import com.campus.market.product.dto.CreateProductRequest;
import com.campus.market.product.dto.ProductDto;
import com.campus.market.product.dto.ProductListItemDto;
import com.campus.market.product.dto.UpdateProductRequest;
import com.campus.market.product.dto.UpdateProductStatusRequest;
import com.campus.market.common.exception.BusinessException;
import com.campus.market.user.User;
import com.campus.market.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;

    public ProductController(ProductService productService, UserRepository userRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
    }

    @GetMapping("/products/latest")
    public ApiResponse<List<ProductListItemDto>> latest(@RequestParam(defaultValue = "8") int limit) {
        return ApiResponse.ok(productService.getLatest(limit));
    }

    @GetMapping("/products")
    public ApiResponse<Page<ProductListItemDto>> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "latest") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        return ApiResponse.ok(productService.list(categoryId, keyword, sort, page, size));
    }

    @GetMapping("/products/{id}")
    public ApiResponse<ProductDto> detail(@PathVariable Long id) {
        return ApiResponse.ok(productService.getDetail(id));
    }

    @PostMapping("/products")
    public ApiResponse<ProductDto> create(@RequestBody CreateProductRequest request,
                                          java.security.Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return ApiResponse.ok(productService.createProduct(user.getId(), request));
    }

    @PutMapping("/products/{id}")
    public ApiResponse<ProductDto> update(@PathVariable Long id,
                                          @RequestBody UpdateProductRequest request,
                                          java.security.Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return ApiResponse.ok(productService.updateProduct(id, user.getId(), request));
    }

    @PatchMapping("/products/{id}/status")
    public ApiResponse<ProductDto> updateStatus(@PathVariable Long id,
                                                @RequestBody UpdateProductStatusRequest request,
                                                java.security.Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return ApiResponse.ok(productService.updateStatus(id, user.getId(), request.getStatus()));
    }

    @DeleteMapping("/products/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id,
                                    java.security.Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
        productService.softDeleteProduct(id, user.getId());
        return ApiResponse.ok(null);
    }

    @GetMapping("/categories")
    public ApiResponse<List<CategoryDto>> categories() {
        return ApiResponse.ok(productService.getCategories());
    }
}
