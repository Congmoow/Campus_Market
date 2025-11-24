package com.campus.market.chat.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatSessionDto {

    private Long id;

    private Long partnerId;

    private String partnerName;

    private String partnerAvatar;

    private Long productId;

    private String productTitle;

    private String lastMessage;

    private LocalDateTime lastTime;

    private long unreadCount;
}
