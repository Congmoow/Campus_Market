package com.campus.market.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 商品分类简要信息 DTO：仅包含分类 id 与名称，用于分类列表 / 下拉选择等场景。
 */
@Data
@AllArgsConstructor
public class CategoryDto {

    private Long id;
    private String name;
}
