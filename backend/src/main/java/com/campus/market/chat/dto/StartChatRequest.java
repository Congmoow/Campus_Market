package com.campus.market.chat.dto;

import lombok.Data;

/**
 * 发起新聊天请求体：指定想就哪个商品发起聊天。
 */
@Data
public class StartChatRequest {

    private Long productId;
}
