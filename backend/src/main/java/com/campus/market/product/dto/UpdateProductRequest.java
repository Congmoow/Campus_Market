package com.campus.market.product.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 更新商品请求体：支持对标题、描述、价格、分类、地点和图片列表进行部分更新。
 */
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
