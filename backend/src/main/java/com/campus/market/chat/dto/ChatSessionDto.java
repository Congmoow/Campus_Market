package com.campus.market.chat.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 聊天会话 DTO：用于消息列表和导航栏通知的会话摘要展示。
 */
@Data
public class ChatSessionDto {

    private Long id;

    private Long partnerId;

    private String partnerName;

    private String partnerAvatar;

    private Long productId;

    private String productTitle;

    private String productThumbnail;

    private BigDecimal productPrice;

    private String lastMessage;

    private LocalDateTime lastTime;

    private long unreadCount;
}
