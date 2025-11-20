package com.campus.market.chat;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByThreadIdOrderByCreatedAtAsc(Long threadId);
    List<ChatMessage> findByThreadIdOrderByCreatedAtDesc(Long threadId, Pageable pageable);
}

