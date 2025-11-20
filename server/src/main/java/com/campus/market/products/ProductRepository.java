package com.campus.market.products;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("select p from Product p where (:keyword is null or p.title like concat('%', :keyword, '%') or p.description like concat('%', :keyword, '%')) "+
           "and (:categoryId is null or p.categoryId = :categoryId) " +
           "and (:campus is null or p.campus = :campus) " +
           "and (:minPrice is null or p.price >= :minPrice) " +
           "and (:maxPrice is null or p.price <= :maxPrice) " +
           "and p.status = 'ACTIVE'")
    Page<Product> search(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("campus") String campus,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            Pageable pageable
    );

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    @Query(value = "select p.* from products p join favorites f on f.product_id = p.id where f.user_id = :userId and p.status <> 'DELETED' order by p.created_at desc",
           countQuery = "select count(*) from favorites f join products p on p.id = f.product_id where f.user_id = :userId and p.status <> 'DELETED'",
           nativeQuery = true)
    Page<Product> findFavorites(@Param("userId") Long userId, Pageable pageable);
}


