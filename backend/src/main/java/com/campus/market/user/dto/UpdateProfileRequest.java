package com.campus.market.user.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String nickname;
    private String avatarUrl;
    private String major;
    private String grade;
    private String campus;
    private String bio;
}
