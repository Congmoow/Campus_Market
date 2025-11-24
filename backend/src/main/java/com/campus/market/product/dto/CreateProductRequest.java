package com.campus.market.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateProductRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private BigDecimal price;

    private BigDecimal originalPrice;

    // 可以传 categoryId 或 categoryName（二选一）
    private Long categoryId;
    private String categoryName;

    private String location;

    // 预留图片 URL 列表（先不在前端使用）
    private List<String> imageUrls;
}
