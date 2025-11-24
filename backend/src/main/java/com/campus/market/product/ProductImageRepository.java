package com.campus.market.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductIdOrderBySortOrderAsc(Long productId);

    void deleteByProductId(Long productId);
}
