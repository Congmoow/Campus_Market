package com.campus.market.user.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户主页展示用的资料 DTO：包含基本信息、信用分、简介以及在售 / 已售统计。
 */
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
