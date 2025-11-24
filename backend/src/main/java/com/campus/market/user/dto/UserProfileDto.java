package com.campus.market.user.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserProfileDto {
    private Long id;
    private String username;
    private String nickname;
    private String avatarUrl;
    private String major;
    private String grade;
    private String campus;
    private Integer credit;
    private String bio;
    private LocalDateTime joinAt;
    private Long sellingCount;
    private Long soldCount;
}
