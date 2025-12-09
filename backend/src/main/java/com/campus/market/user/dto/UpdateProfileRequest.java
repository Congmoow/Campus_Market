package com.campus.market.user.dto;

import lombok.Data;

/**
 * 更新个人资料请求体：前端可提交昵称、头像、专业、年级、校区、个人简介等字段。
 */
@Data
public class UpdateProfileRequest {
    private String nickname;
    private String avatarUrl;
    private String major;
    private String grade;
    private String campus;
    private String bio;
}
