package com.campus.market.chat;

import com.campus.market.chat.dto.ChatMessageDto;
import com.campus.market.chat.dto.ChatSessionDto;
import com.campus.market.chat.dto.SendMessageRequest;
import com.campus.market.chat.dto.StartChatRequest;
import com.campus.market.common.api.ApiResponse;
import com.campus.market.common.exception.BusinessException;
import com.campus.market.user.User;
import com.campus.market.user.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    private User requireUser(Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
    }

    @GetMapping("/chats")
    public ApiResponse<List<ChatSessionDto>> listSessions(Principal principal) {
        User user = requireUser(principal);
        return ApiResponse.ok(chatService.listSessions(user.getId()));
    }

    @PostMapping("/chats/read-all")
    public ApiResponse<Void> markAllRead(Principal principal) {
        User user = requireUser(principal);
        chatService.markAllAsRead(user.getId());
        return ApiResponse.ok(null);
    }

    @GetMapping("/chats/{sessionId}/messages")
    public ApiResponse<List<ChatMessageDto>> listMessages(@PathVariable Long sessionId,
                                                          Principal principal) {
        User user = requireUser(principal);
        return ApiResponse.ok(chatService.listMessages(sessionId, user.getId()));
    }

    @PostMapping("/chats/start")
    public ApiResponse<ChatSessionDto> startChat(@RequestBody StartChatRequest request,
                                                 Principal principal) {
        User user = requireUser(principal);
        return ApiResponse.ok(chatService.startChat(user.getId(), request));
    }

    @PostMapping("/chats/{sessionId}/messages")
    public ApiResponse<ChatMessageDto> sendMessage(@PathVariable Long sessionId,
                                                   @RequestBody SendMessageRequest request,
                                                   Principal principal) {
        User user = requireUser(principal);
        return ApiResponse.ok(chatService.sendMessage(sessionId, user.getId(), request));
    }
}
