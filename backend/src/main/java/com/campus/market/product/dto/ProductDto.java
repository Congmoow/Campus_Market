package com.campus.market.product.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 商品详情 DTO：用于商品详情页展示，包含价格、描述、分类、图片列表及卖家信息等。
 */
@Data
public class ProductDto {

    private Long id;
    private String title;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String status;
    private String location;
    private LocalDateTime createdAt;
    private List<String> images;
    private Long viewCount;

    private Long sellerId;
    private String sellerName;
    private String sellerAvatar;
}
