package com.campus.market.chat;

import com.campus.market.chat.dto.ChatMessageDto;
import com.campus.market.chat.dto.ChatSessionDto;
import com.campus.market.chat.dto.SendMessageRequest;
import com.campus.market.chat.dto.StartChatRequest;
import com.campus.market.common.exception.BusinessException;
import com.campus.market.product.Product;
import com.campus.market.product.ProductRepository;
import com.campus.market.product.ProductService;
import com.campus.market.product.dto.ProductListItemDto;
import com.campus.market.user.UserProfile;
import com.campus.market.user.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserProfileRepository userProfileRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    public ChatService(ChatSessionRepository chatSessionRepository,
                       ChatMessageRepository chatMessageRepository,
                       UserProfileRepository userProfileRepository,
                       ProductRepository productRepository,
                       ProductService productService) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userProfileRepository = userProfileRepository;
        this.productRepository = productRepository;
        this.productService = productService;
    }

    @Transactional(readOnly = true)
    public List<ChatSessionDto> listSessions(Long userId) {
        List<ChatSession> sessions = chatSessionRepository.findByBuyerIdOrSellerIdOrderByLastTimeDesc(userId, userId);
        return sessions.stream().map(session -> toSessionDto(session, userId)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> listMessages(Long sessionId, Long userId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("会话不存在"));
        if (!Objects.equals(session.getBuyerId(), userId) && !Objects.equals(session.getSellerId(), userId)) {
            throw new BusinessException("无权查看该会话");
        }

        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        // 将对方发送的消息标记为已读
        messages.stream()
                .filter(m -> !Objects.equals(m.getSenderId(), userId) && !Boolean.TRUE.equals(m.getRead()))
                .forEach(m -> m.setRead(true));

        return messages.stream().map(this::toMessageDto).collect(Collectors.toList());
    }

    /**
     * 将当前用户所有会话中的未读消息标记为已读。
     */
    public void markAllAsRead(Long userId) {
        if (userId == null) {
            throw new BusinessException("未登录");
        }

        List<ChatSession> sessions = chatSessionRepository.findByBuyerIdOrSellerIdOrderByLastTimeDesc(userId, userId);
        for (ChatSession session : sessions) {
            List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
            messages.stream()
                    .filter(m -> !Objects.equals(m.getSenderId(), userId) && !Boolean.TRUE.equals(m.getRead()))
                    .forEach(m -> m.setRead(true));
        }
    }

    public ChatSessionDto startChat(Long userId, StartChatRequest request) {
        if (request.getProductId() == null) {
            throw new BusinessException("productId 不能为空");
        }
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("商品不存在"));

        if (Objects.equals(product.getSellerId(), userId)) {
            throw new BusinessException("不能与自己发起聊天");
        }

        Long buyerId = userId;
        Long sellerId = product.getSellerId();

        ChatSession session = chatSessionRepository
                .findByBuyerIdAndSellerIdAndProductId(buyerId, sellerId, product.getId())
                .orElseGet(() -> {
                    ChatSession s = new ChatSession();
                    s.setBuyerId(buyerId);
                    s.setSellerId(sellerId);
                    s.setProductId(product.getId());
                    s.setLastTime(LocalDateTime.now());
                    s.setLastMessage(null);
                    return chatSessionRepository.save(s);
                });

        return toSessionDto(session, userId);
    }

    public ChatMessageDto sendMessage(Long sessionId, Long userId, SendMessageRequest request) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("会话不存在"));
        if (!Objects.equals(session.getBuyerId(), userId) && !Objects.equals(session.getSellerId(), userId)) {
            throw new BusinessException("无权发送该会话的消息");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new BusinessException("消息内容不能为空");
        }

        ChatMessage message = new ChatMessage();
        message.setSessionId(sessionId);
        message.setSenderId(userId);
        message.setType(request.getType() != null ? request.getType() : "TEXT");
        message.setContent(request.getContent());
        message = chatMessageRepository.save(message);

        session.setLastMessage(request.getContent());
        session.setLastTime(LocalDateTime.now());
        chatSessionRepository.save(session);

        return toMessageDto(message);
    }

    public ChatMessageDto sendSystemMessageToUser(Long targetUserId, String content) {
        if (targetUserId == null) {
            throw new BusinessException("userId 不能为空");
        }
        if (content == null || content.isBlank()) {
            throw new BusinessException("消息内容不能为空");
        }

        userProfileRepository.findByUserId(targetUserId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        Long systemUserId = 0L;

        ChatSession session = chatSessionRepository
                .findByBuyerIdAndSellerIdAndProductIdIsNull(targetUserId, systemUserId)
                .orElseGet(() -> {
                    ChatSession s = new ChatSession();
                    s.setBuyerId(targetUserId);
                    s.setSellerId(systemUserId);
                    s.setProductId(null);
                    s.setLastTime(LocalDateTime.now());
                    s.setLastMessage(null);
                    return chatSessionRepository.save(s);
                });

        ChatMessage message = new ChatMessage();
        message.setSessionId(session.getId());
        message.setSenderId(systemUserId);
        message.setType("TEXT");
        message.setContent(content);
        message = chatMessageRepository.save(message);

        session.setLastMessage(content);
        session.setLastTime(LocalDateTime.now());
        chatSessionRepository.save(session);

        return toMessageDto(message);
    }

    private ChatSessionDto toSessionDto(ChatSession session, Long currentUserId) {
        ChatSessionDto dto = new ChatSessionDto();
        dto.setId(session.getId());
        dto.setProductId(session.getProductId());
        dto.setLastMessage(session.getLastMessage());
        dto.setLastTime(session.getLastTime());

        Long partnerId = Objects.equals(session.getBuyerId(), currentUserId)
                ? session.getSellerId()
                : session.getBuyerId();
        dto.setPartnerId(partnerId);

        UserProfile profile = userProfileRepository.findByUserId(partnerId).orElse(null);
        if (profile != null) {
            dto.setPartnerName(profile.getNickname());
            dto.setPartnerAvatar(profile.getAvatarUrl());
        } else if (Objects.equals(partnerId, 0L)) {
            // 系统通知会话：没有真实用户资料时，统一使用固定的系统名称和头像
            dto.setPartnerName("系统通知");
            dto.setPartnerAvatar("https://api.dicebear.com/7.x/bottts/svg?seed=system-notice");
        }

        long unread = chatMessageRepository.countBySessionIdAndSenderIdNotAndReadFalse(session.getId(), currentUserId);
        dto.setUnreadCount(unread);

        // 通过 productRepository 和 productService 填充商品相关摘要信息
        if (session.getProductId() != null) {
            Product product = productRepository.findById(session.getProductId()).orElse(null);
            if (product != null) {
                dto.setProductTitle(product.getTitle());

                ProductListItemDto productListItemDto = productService.toListItemDto(product);
                dto.setProductThumbnail(productListItemDto.getThumbnail());
                dto.setProductPrice(productListItemDto.getPrice());
            }
        }

        return dto;
    }

    private ChatMessageDto toMessageDto(ChatMessage message) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(message.getId());
        dto.setSenderId(message.getSenderId());
        dto.setType(message.getType());
        dto.setContent(message.getContent());
        dto.setRead(Boolean.TRUE.equals(message.getRead()));
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}
