package com.campus.market.products;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.stream.Collectors;

import com.campus.market.products.dto.ProductDetailDto;
import com.campus.market.products.dto.ProductUpdateStatusDto;
import com.campus.market.products.dto.ProductSummaryDto;
import com.campus.market.users.User;
import com.campus.market.users.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductService productService;
    private final FavoriteService favoriteService;
    private final UserRepository userRepository;

    public ProductController(ProductRepository productRepository,
                             ProductService productService,
                             FavoriteService favoriteService,
                             UserRepository userRepository) {
        this.productRepository = productRepository;
        this.productService = productService;
        this.favoriteService = favoriteService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public Page<ProductSummaryDto> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ) {
        Sort sort = Sort.by("desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC, mapSortBy(sortBy));
        Pageable pageable = PageRequest.of(page, size, sort);
        // 始终仅展示在售，若显式传入status则使用入参
        Page<Product> pageData = productRepository.search(keyword, categoryId, campus, minPrice, maxPrice, pageable);
        
        Set<Long> sellerIds = pageData.getContent().stream().map(Product::getSellerId).collect(Collectors.toSet());
        Map<Long, User> sellers = userRepository.findAllById(sellerIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return new PageImpl<>(
                pageData.getContent().stream()
                        .map(p -> ProductMapper.toSummary(p, sellers.get(p.getSellerId())))
                        .collect(Collectors.toList()),
                pageable,
                pageData.getTotalElements()
        );
    }

    @GetMapping("/{id}")
    public ProductDetailDto detail(@PathVariable Long id,
                                   org.springframework.security.core.Authentication authentication) {
        ProductDetailDto dto = productService.getDetail(id);
        if (authentication != null && authentication.getPrincipal() != null) {
            long userId = Long.parseLong(String.valueOf(authentication.getPrincipal()));
            boolean favorited = favoriteService.isFavorited(userId, id);
            dto.setFavorited(favorited);
        } else {
            dto.setFavorited(false);
        }
        return dto;
    }

    @PostMapping
    public Product create(@RequestBody @jakarta.validation.Valid com.campus.market.products.dto.ProductCreateDto dto,
                          org.springframework.security.core.Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登录");
        }
        long sellerId = Long.parseLong(String.valueOf(authentication.getPrincipal()));
        return productService.create(sellerId, dto);
    }

    @PostMapping("/{id}/favorite")
    public org.springframework.http.ResponseEntity<Void> toggleFavorite(@PathVariable Long id,
                               org.springframework.security.core.Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return org.springframework.http.ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        long userId = Long.parseLong(String.valueOf(authentication.getPrincipal()));
        favoriteService.toggleFavorite(userId, id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public Page<ProductSummaryDto> myProducts(org.springframework.security.core.Authentication authentication,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登录");
        }
        long sellerId = Long.parseLong(String.valueOf(authentication.getPrincipal()));
        User currentUser = userRepository.findById(sellerId).orElse(null);
        
        Page<Product> pageData = productRepository.findBySellerId(sellerId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return new PageImpl<>(
                pageData.getContent().stream().map(p -> ProductMapper.toSummary(p, currentUser)).collect(Collectors.toList()),
                pageData.getPageable(),
                pageData.getTotalElements()
        );
    }

    @GetMapping("/favorites/me")
    public Page<ProductSummaryDto> myFavorites(org.springframework.security.core.Authentication authentication,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "20") int size) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登录");
        }
        long userId = Long.parseLong(String.valueOf(authentication.getPrincipal()));
        Page<Product> pageData = productRepository.findFavorites(userId, PageRequest.of(page, size));
        
        Set<Long> sellerIds = pageData.getContent().stream().map(Product::getSellerId).collect(Collectors.toSet());
        Map<Long, User> sellers = userRepository.findAllById(sellerIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
                
        return new PageImpl<>(
                pageData.getContent().stream().map(p -> ProductMapper.toSummary(p, sellers.get(p.getSellerId()))).collect(Collectors.toList()),
                pageData.getPageable(),
                pageData.getTotalElements()
        );
    }

    @PutMapping("/{id}/status")
    public Product updateStatus(@PathVariable Long id,
                                @RequestBody ProductUpdateStatusDto dto,
                                org.springframework.security.core.Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登录");
        }
        long sellerId = Long.parseLong(String.valueOf(authentication.getPrincipal()));
        return productService.updateStatus(sellerId, id, dto.getStatus());
    }

    private String mapSortBy(String sortBy) {
        return switch (sortBy) {
            case "price" -> "price";
            case "views" -> "views";
            default -> "createdAt";
        };
    }
}


