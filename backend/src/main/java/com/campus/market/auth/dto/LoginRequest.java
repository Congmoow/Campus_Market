package com.campus.market.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank
    private String usernameOrPhone;

    @NotBlank
    private String password;
}
