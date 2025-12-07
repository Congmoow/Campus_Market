package com.campus.market.user;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface UserProfileRepository extends BaseMapper<UserProfile> {

    default Optional<UserProfile> findByUserId(Long userId) {
        if (userId == null) {
            return Optional.empty();
        }
        LambdaQueryWrapper<UserProfile> wrapper = Wrappers.lambdaQuery(UserProfile.class)
                .eq(UserProfile::getUserId, userId);
        return Optional.ofNullable(selectOne(wrapper));
    }

    default int update(UserProfile profile) {
        return updateById(profile);
    }
}
