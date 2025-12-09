package com.campus.market.product.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品列表项 DTO：用于首页 / 列表页卡片展示的精简字段集合。
 */
@Data
public class ProductListItemDto {

    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private String thumbnail;
    private String location;
    private LocalDateTime createdAt;
    private String status;
    private Long viewCount;

    private Long sellerId;
    private String sellerName;
    private String sellerAvatar;
}
