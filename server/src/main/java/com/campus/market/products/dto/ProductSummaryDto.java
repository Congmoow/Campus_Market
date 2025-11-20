package com.campus.market.products.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSummaryDto {
    private Long id;
    private String title;
    private String coverImage;
    private Double price;
    private String condition;
    private Long categoryId;
    private String categoryName;
    private String campus;
    private String status;
    private Integer views;
    private Integer favorites;
    private String createdAt;
    private String description;
    private SellerDto seller;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SellerDto {
        private Long id;
        private String nickname;
        private String campus;
        private Double rating;
        private String avatar;
    }
}


