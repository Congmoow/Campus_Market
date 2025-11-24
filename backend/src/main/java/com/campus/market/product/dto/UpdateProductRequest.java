package com.campus.market.product.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateProductRequest {

    private String title;

    private String description;

    private BigDecimal price;

    private BigDecimal originalPrice;

    // 可以传 categoryId 或 categoryName
    private Long categoryId;
    private String categoryName;

    private String location;

    private List<String> imageUrls;
}
