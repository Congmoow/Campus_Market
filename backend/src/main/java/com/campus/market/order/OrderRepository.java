package com.campus.market.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<OrderEntity> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    List<OrderEntity> findByBuyerIdAndStatusOrderByCreatedAtDesc(Long buyerId, String status);

    List<OrderEntity> findBySellerIdAndStatusOrderByCreatedAtDesc(Long sellerId, String status);
}
