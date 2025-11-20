package com.campus.market.chat;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ChatService {
    private final ChatThreadRepository threadRepository;
    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;

    public ChatService(ChatThreadRepository threadRepository,
                       ChatConversationRepository conversationRepository,
                       ChatMessageRepository messageRepository) {
        this.threadRepository = threadRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    public List<ChatConversation> listConversations(Long userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public List<ChatMessage> listMessages(Long threadId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        List<ChatMessage> paged = messageRepository.findByThreadIdOrderByCreatedAtDesc(threadId, pageable);
        paged.sort(Comparator.comparing(ChatMessage::getCreatedAt));
        return paged;
    }

    public ChatConversation openConversation(Long userId, Long peerId) {
        ChatThread thread = findOrCreateThread(userId, peerId);
        ChatConversation conversation = conversationRepository.findByThreadIdAndUserId(thread.getId(), userId)
                .orElseGet(() -> createConversation(thread.getId(), userId, peerId));
        createConversation(thread.getId(), peerId, userId);
        return conversation;
    }

    public ChatMessage sendMessage(Long userId, Long threadId, Long receiverId, String content) {
        ChatMessage message = new ChatMessage();
        message.setThreadId(threadId);
        message.setSenderId(userId);
        message.setReceiverId(receiverId);
        message.setContent(content);
        ChatMessage saved = messageRepository.save(message);

        conversationRepository.findByThreadIdAndUserId(threadId, userId).ifPresent(c -> {
            c.setLastMessage(content);
            c.setUpdatedAt(Instant.now());
            conversationRepository.save(c);
        });

        conversationRepository.findByThreadIdAndUserId(threadId, receiverId).ifPresent(c -> {
            c.setLastMessage(content);
            c.setLastMessageFromPeer(content);
            c.setUnreadCount(Optional.ofNullable(c.getUnreadCount()).orElse(0) + 1);
            c.setUpdatedAt(Instant.now());
            conversationRepository.save(c);
        });

        return saved;
    }

    public void markRead(Long threadId, Long userId) {
        conversationRepository.findByThreadIdAndUserId(threadId, userId).ifPresent(c -> {
            c.setUnreadCount(0);
            conversationRepository.save(c);
        });
    }

    private ChatThread findOrCreateThread(Long userId, Long peerId) {
        Long min = Math.min(userId, peerId);
        Long max = Math.max(userId, peerId);
        return threadRepository.findByUserAIdAndUserBId(min, max)
                .orElseGet(() -> {
                    ChatThread thread = new ChatThread();
                    thread.setUserAId(min);
                    thread.setUserBId(max);
                    return threadRepository.save(thread);
                });
    }

    private ChatConversation createConversation(Long threadId, Long ownerId, Long peerId) {
        return conversationRepository.findByThreadIdAndUserId(threadId, ownerId).orElseGet(() -> {
            ChatConversation conversation = new ChatConversation();
            conversation.setThreadId(threadId);
            conversation.setUserId(ownerId);
            conversation.setPeerId(peerId);
            conversation.setUnreadCount(0);
            conversation.setUpdatedAt(Instant.now());
            return conversationRepository.save(conversation);
        });
    }
}

