package com.campus.market.product.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
