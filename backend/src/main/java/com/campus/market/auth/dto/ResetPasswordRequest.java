package com.campus.market.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * 密码重置请求 DTO
 * 通过学号+手机号验证身份
 */
@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "学号不能为空")
    private String username;

    @NotBlank(message = "手机号不能为空")
    private String phone;

    @NotBlank(message = "新密码不能为空")
    @Size(min = 6, max = 50, message = "密码长度需在6-50位之间")
    private String newPassword;
}
