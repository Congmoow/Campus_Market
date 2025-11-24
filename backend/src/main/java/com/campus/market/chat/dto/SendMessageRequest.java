package com.campus.market.chat.dto;

import lombok.Data;

@Data
public class SendMessageRequest {

    private String type;

    private String content;
}
