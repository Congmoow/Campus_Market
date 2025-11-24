package com.campus.market.order.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单详情/列表展示 DTO
 */
@Data
public class OrderDto {

    private Long id;

    private String status;

    private Long productId;

    private String productTitle;

    private String productImage;

    private Long buyerId;

    private String buyerName;

    private String buyerAvatar;

    private Long sellerId;

    private String sellerName;

    private String sellerAvatar;

    private BigDecimal price;

    private String meetLocation;

    private LocalDateTime meetTime;

    private LocalDateTime createdAt;
}
