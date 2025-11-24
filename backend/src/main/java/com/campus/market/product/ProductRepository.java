package com.campus.market.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Product> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    Page<Product> findByCategoryIdAndTitleContainingIgnoreCase(Long categoryId, String keyword, Pageable pageable);

    List<Product> findTop8ByStatusOrderByCreatedAtDesc(String status);

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    Page<Product> findBySellerIdAndStatus(Long sellerId, String status, Pageable pageable);
}
