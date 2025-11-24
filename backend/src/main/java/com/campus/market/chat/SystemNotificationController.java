package com.campus.market.chat;

import com.campus.market.chat.dto.ChatMessageDto;
import com.campus.market.chat.dto.SystemNotificationRequest;
import com.campus.market.common.api.ApiResponse;
import com.campus.market.common.exception.BusinessException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
public class SystemNotificationController {

    private final ChatService chatService;

    public SystemNotificationController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/notifications")
    public ApiResponse<ChatMessageDto> sendSystemNotification(@RequestBody SystemNotificationRequest request) {
        if (request.getUserId() == null) {
            throw new BusinessException("userId 不能为空");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new BusinessException("内容不能为空");
        }
        return ApiResponse.ok(chatService.sendSystemMessageToUser(request.getUserId(), request.getContent()));
    }
}
