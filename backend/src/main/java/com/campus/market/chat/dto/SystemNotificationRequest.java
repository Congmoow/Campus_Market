package com.campus.market.chat.dto;

import lombok.Data;

/**
 * 发送系统通知请求体。
 *
 * userId 为接收方用户 ID，content 为通知内容。
 */
@Data
public class SystemNotificationRequest {

    private Long userId;

    private String content;
}
