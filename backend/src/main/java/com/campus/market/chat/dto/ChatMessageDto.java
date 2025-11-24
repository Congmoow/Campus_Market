package com.campus.market.chat.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessageDto {

    private Long id;

    private Long senderId;

    private String type;

    private String content;

    private boolean read;

    private LocalDateTime createdAt;
}
