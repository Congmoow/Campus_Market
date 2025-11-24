package com.campus.market.order.dto;

import lombok.Data;

/**
 * 创建订单请求体
 */
@Data
public class CreateOrderRequest {

    /** 商品 ID */
    private Long productId;
}
