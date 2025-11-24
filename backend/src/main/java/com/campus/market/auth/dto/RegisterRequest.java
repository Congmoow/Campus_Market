package com.campus.market.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String username; // 学号

    private String phone;

    @NotBlank
    private String password;

    @NotBlank
    private String nickname;
}
