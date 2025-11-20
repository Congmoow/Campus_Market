package com.campus.market.products.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateStatusDto {
    private String status; // ACTIVE | RESERVED | SOLD | DELETED
}



