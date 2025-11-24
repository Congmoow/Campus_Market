package com.campus.market.chat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    List<ChatSession> findByBuyerIdOrSellerIdOrderByLastTimeDesc(Long buyerId, Long sellerId);

    Optional<ChatSession> findByBuyerIdAndSellerIdAndProductId(Long buyerId, Long sellerId, Long productId);

    Optional<ChatSession> findByBuyerIdAndSellerIdAndProductIdIsNull(Long buyerId, Long sellerId);
}
