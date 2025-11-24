package com.campus.market.favorite;

import com.campus.market.common.exception.BusinessException;
import com.campus.market.product.Product;
import com.campus.market.product.ProductRepository;
import com.campus.market.product.ProductService;
import com.campus.market.product.dto.ProductListItemDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public FavoriteService(FavoriteRepository favoriteRepository,
                           ProductRepository productRepository,
                           ProductService productService) {
        this.favoriteRepository = favoriteRepository;
        this.productRepository = productRepository;
        this.productService = productService;
    }

    @Transactional(readOnly = true)
    public List<ProductListItemDto> listMyFavorites(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        if (favorites.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> productIds = favorites.stream()
                .map(Favorite::getProductId)
                .toList();

        List<Product> products = productRepository.findAllById(productIds);
        Map<Long, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        return favorites.stream()
                .map(f -> productMap.get(f.getProductId()))
                .filter(Objects::nonNull)
                // 过滤掉已删除的商品
                .filter(p -> !"DELETED".equals(p.getStatus()))
                .map(productService::toListItemDto)
                .collect(Collectors.toList());
    }

    public void addFavorite(Long userId, Long productId) {
        if (favoriteRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            return;
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("商品不存在"));
        if ("DELETED".equals(product.getStatus())) {
            throw new BusinessException("商品已被删除");
        }

        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setProductId(productId);
        favoriteRepository.save(favorite);
    }

    public void removeFavorite(Long userId, Long productId) {
        favoriteRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(favoriteRepository::delete);
    }
}
