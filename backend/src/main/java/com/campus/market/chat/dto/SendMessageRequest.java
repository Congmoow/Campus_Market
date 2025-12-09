package com.campus.market.chat.dto;

import lombok.Data;

/**
 * 发送消息请求体。
 *
 * type 为消息类型（TEXT / IMAGE 等），content 为消息内容或图片 DataURL。
 */
@Data
public class SendMessageRequest {

    private String type;

    private String content;
}
