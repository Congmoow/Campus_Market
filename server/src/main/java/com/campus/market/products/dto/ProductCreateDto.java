package com.campus.market.products.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductCreateDto {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal price;

    @NotBlank
    private String condition;

    @NotNull
    private Long categoryId;

    @NotBlank
    private String campus;

    @Size(min = 1, max = 9)
    private List<@NotBlank String> images;
}


