package com.campus.market.chat.dto;

import lombok.Data;

@Data
public class SystemNotificationRequest {

    private Long userId;

    private String content;
}
