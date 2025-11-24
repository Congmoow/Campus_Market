package com.campus.market.product.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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

    private Long sellerId;
    private String sellerName;
    private String sellerAvatar;
}
