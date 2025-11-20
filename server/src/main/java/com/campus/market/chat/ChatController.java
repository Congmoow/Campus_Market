package com.campus.market.chat;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import com.campus.market.users.User;
import com.campus.market.users.UserRepository;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    private long currentUserId(org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登录");
        }
        Object principal = authentication.getPrincipal();
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登录");
        }
        if (principal instanceof Long l) return l;
        if (principal instanceof Integer i) return i.longValue();
        String raw = String.valueOf(principal);
        try {
            return Long.parseLong(raw);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "身份信息异常");
        }
    }

    @GetMapping("/conversations")
    public List<ConversationDto> listConversations(org.springframework.security.core.Authentication authentication) {
        long userId = currentUserId(authentication);
        return chatService.listConversations(userId).stream()
                .map(c -> toDto(userId, c))
                .toList();
    }

    @GetMapping("/conversations/{id}/messages")
    public List<MessageView> listMessages(@PathVariable Long id,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "50") int size,
                                         org.springframework.security.core.Authentication authentication) {
        long userId = currentUserId(authentication);
        ChatConversation conversation = chatService.listConversations(userId).stream()
                .filter(c -> Objects.equals(c.getId(), id))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "无权访问该会话"));
        return chatService.listMessages(conversation.getThreadId(), page, size).stream()
                .map(m -> new MessageView(m.getId(), id, Objects.equals(m.getSenderId(), userId), m.getContent(), m.getCreatedAt().toString()))
                .toList();
    }

    @PostMapping("/conversations/{id}/messages")
    public MessageView send(@PathVariable Long id,
                           @RequestBody SendDto body,
                           org.springframework.security.core.Authentication authentication) {
        long userId = currentUserId(authentication);
        ChatConversation conversation = chatService.listConversations(userId).stream()
                .filter(c -> Objects.equals(c.getId(), id))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "会话不存在"));
        Long otherUserId = conversation.getPeerId();
        ChatMessage saved = chatService.sendMessage(userId, conversation.getThreadId(), otherUserId, body.content());
        return new MessageView(saved.getId(), id, true, saved.getContent(), saved.getCreatedAt().toString());
    }

    @PostMapping("/open")
    public ConversationDto openConversation(@RequestBody OpenDto body,
                                            org.springframework.security.core.Authentication authentication) {
        long userId = currentUserId(authentication);
        if (body == null || body.peerId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "peerId 不能为空");
        }
        ChatConversation conversation = chatService.openConversation(userId, body.peerId());
        return toDto(userId, conversation);
    }

    @PostMapping("/conversations/{id}/read")
    public void markRead(@PathVariable Long id,
                         org.springframework.security.core.Authentication authentication) {
        long userId = currentUserId(authentication);
        ChatConversation conversation = chatService.listConversations(userId).stream()
                .filter(c -> Objects.equals(c.getId(), id))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "会话不存在"));
        chatService.markRead(conversation.getThreadId(), userId);
    }

    public record MessageView(Long id, Long conversationId, boolean fromMe, String content, String time) {}
    public record SendDto(String content) {}
    public record OpenDto(Long peerId, String name, String avatar) {}

    private ConversationDto findConversation(Long userId, Long conversationId) {
        return chatService.listConversations(userId).stream()
                .filter(c -> Objects.equals(c.getId(), conversationId))
                .map(c -> toDto(userId, c))
                .findFirst()
                .orElse(null);
    }

    private ConversationDto toDto(Long currentUserId, ChatConversation conversation) {
        User peerUser = userRepository.findById(conversation.getPeerId()).orElse(null);
        String peerName = resolveNickname(peerUser, conversation.getPeerId(), null);
        String peerAvatar = resolveAvatar(peerUser, null);
        return new ConversationDto(
                conversation.getId(),
                peerName,
                peerAvatar,
                conversation.getLastMessage(),
                conversation.getLastMessageFromPeer(),
                conversation.getUserId(),
                conversation.getPeerId(),
                conversation.getThreadId(),
                conversation.getUnreadCount()
        );
    }

    private String resolveNickname(User user, Long fallbackId, String provided) {
        if (user != null && user.getNickname() != null && !user.getNickname().isBlank()) {
            return user.getNickname();
        }
        if (provided != null && !provided.isBlank()) {
            return provided;
        }
        return fallbackId != null ? "用户" + fallbackId : "对方";
    }

    private String resolveAvatar(User user, String provided) {
        if (user != null && user.getAvatar() != null && !user.getAvatar().isBlank()) {
            return user.getAvatar();
        }
        if (provided != null && !provided.isBlank()) {
            return provided;
        }
        return null;
    }

    public static class ConversationDto {
        private final Long id;
        private String name;
        private String avatar;
        private String lastMessage;
        private String lastMessageFromPeer;
        private final Long userId;
        private final Long peerId;
        private final Long threadId;
        private Integer unreadCount;

        public ConversationDto(Long id, String name, String avatar, String lastMessage, String lastMessageFromPeer,
                               Long userId, Long peerId, Long threadId, Integer unreadCount) {
            this.id = id;
            this.name = name;
            this.avatar = avatar;
            this.lastMessage = lastMessage;
            this.lastMessageFromPeer = lastMessageFromPeer;
            this.userId = userId;
            this.peerId = peerId;
            this.threadId = threadId;
            this.unreadCount = unreadCount;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getAvatar() { return avatar; }
        public String getLastMessage() { return lastMessage; }
        public Long getUserId() { return userId; }
        public Long getPeerId() { return peerId; }
        public Long getThreadId() { return threadId; }
        public Integer getUnreadCount() { return unreadCount; }

        public void setLastMessage(String m) { this.lastMessage = m; }
        public void setUnreadCount(Integer u) { this.unreadCount = u; }
        public void setName(String name) { this.name = name; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
        public String getLastMessageFromPeer() { return lastMessageFromPeer; }
        public void setLastMessageFromPeer(String lastMessageFromPeer) { this.lastMessageFromPeer = lastMessageFromPeer; }
    }
}


