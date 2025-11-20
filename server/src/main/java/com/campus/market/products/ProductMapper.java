package com.campus.market.products;

import com.campus.market.products.dto.ProductDetailDto;
import com.campus.market.products.dto.ProductSummaryDto;
import com.campus.market.users.User;

import java.time.ZoneOffset;
import java.util.Collections;
import java.util.stream.Collectors;

public class ProductMapper {
    public static ProductSummaryDto toSummary(Product p, User seller) {
        String cover = p.getImages() != null && !p.getImages().isEmpty() ? p.getImages().get(0).getUrl() : null;
        String sellerNickname = "用户" + p.getSellerId();
        if (seller != null && seller.getNickname() != null && !seller.getNickname().isBlank()) {
            sellerNickname = seller.getNickname();
        }
        return ProductSummaryDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .coverImage(cover)
                .price(p.getPrice() != null ? p.getPrice().doubleValue() : null)
                .condition(p.getCondition())
                .categoryId(p.getCategoryId())
                .description(p.getDescription())
                .campus(p.getCampus())
                .status(p.getStatus())
                .views(p.getViews())
                .favorites(p.getFavorites())
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().atOffset(ZoneOffset.UTC).toString() : null)
                .seller(ProductSummaryDto.SellerDto.builder()
                        .id(p.getSellerId())
                        .nickname(sellerNickname)
                        .campus(seller != null ? seller.getCampus() : p.getCampus())
                        .rating(4.8)
                        .avatar(seller != null ? seller.getAvatar() : null)
                        .build())
                .build();
    }
    
    public static ProductSummaryDto toSummary(Product p) {
        return toSummary(p, null);
    }

    public static ProductDetailDto toDetail(Product p, User seller, String categoryName) {
        String cover = p.getImages() != null && !p.getImages().isEmpty() ? p.getImages().get(0).getUrl() : null;
        String sellerNickname = "用户" + p.getSellerId();
        if (seller != null && seller.getNickname() != null && !seller.getNickname().isBlank()) {
            sellerNickname = seller.getNickname();
        }
        return ProductDetailDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .price(p.getPrice() != null ? p.getPrice().doubleValue() : null)
                .condition(p.getCondition())
                .categoryId(p.getCategoryId())
                .categoryName(categoryName)
                .campus(p.getCampus())
                .status(p.getStatus())
                .views(p.getViews())
                .favorites(p.getFavorites())
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().atOffset(ZoneOffset.UTC).toString() : null)
                .updatedAt(p.getUpdatedAt() != null ? p.getUpdatedAt().atOffset(ZoneOffset.UTC).toString() : null)
                .coverImage(cover)
                .images(p.getImages() != null ? p.getImages().stream().map(ProductImage::getUrl).collect(Collectors.toList()) : Collections.emptyList())
                .seller(ProductDetailDto.SellerDto.builder()
                        .id(seller != null ? seller.getId() : null)
                        .nickname(sellerNickname)
                        .campus(seller != null ? seller.getCampus() : p.getCampus())
                        .rating(null)
                        .avatar(seller != null ? seller.getAvatar() : null)
                        .build())
                .build();
    }
}


