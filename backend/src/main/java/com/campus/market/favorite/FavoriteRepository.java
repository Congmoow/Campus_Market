package com.campus.market.favorite;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.apache.ibatis.annotations.Mapper;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Mapper
public interface FavoriteRepository extends BaseMapper<Favorite> {

    default List<Favorite> findByUserId(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<Favorite> wrapper = Wrappers.lambdaQuery(Favorite.class)
                .eq(Favorite::getUserId, userId)
                .orderByDesc(Favorite::getCreatedAt, Favorite::getId);
        return selectList(wrapper);
    }

    default Optional<Favorite> findByUserIdAndProductId(Long userId, Long productId) {
        if (userId == null || productId == null) {
            return Optional.empty();
        }
        LambdaQueryWrapper<Favorite> wrapper = Wrappers.lambdaQuery(Favorite.class)
                .eq(Favorite::getUserId, userId)
                .eq(Favorite::getProductId, productId);
        return Optional.ofNullable(selectOne(wrapper));
    }

    default int delete(Favorite favorite) {
        if (favorite == null || favorite.getId() == null) {
            return 0;
        }
        return deleteById(favorite.getId());
    }
}
