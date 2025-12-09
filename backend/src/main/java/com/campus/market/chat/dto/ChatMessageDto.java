package com.campus.market.chat.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 聊天消息 DTO：用于前端展示单条消息内容。
 *
 * type 常见取值：TEXT / IMAGE / RECALL。
 */
@Data
public class ChatMessageDto {

    private Long id;

    private Long senderId;

    private String type;

    private String content;

    private boolean read;

    private LocalDateTime createdAt;
}
