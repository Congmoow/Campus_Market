package com.campus.market.chat;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ChatSessionRepository extends BaseMapper<ChatSession> {

    default Optional<ChatSession> findById(Long id) {
        return Optional.ofNullable(selectById(id));
    }

    default List<ChatSession> findByBuyerIdOrSellerIdOrderByLastTimeDesc(Long buyerId, Long sellerId) {
        if (buyerId == null && sellerId == null) {
            return List.of();
        }
        LambdaQueryWrapper<ChatSession> wrapper = Wrappers.lambdaQuery(ChatSession.class);
        if (buyerId != null && sellerId != null) {
            wrapper.and(w -> w.eq(ChatSession::getBuyerId, buyerId)
                    .or()
                    .eq(ChatSession::getSellerId, sellerId));
        } else if (buyerId != null) {
            wrapper.eq(ChatSession::getBuyerId, buyerId);
        } else {
            wrapper.eq(ChatSession::getSellerId, sellerId);
        }
        wrapper.orderByDesc(ChatSession::getLastTime, ChatSession::getId);
        return selectList(wrapper);
    }

    default Optional<ChatSession> findByBuyerIdAndSellerIdAndProductId(Long buyerId, Long sellerId, Long productId) {
        if (buyerId == null || sellerId == null || productId == null) {
            return Optional.empty();
        }
        LambdaQueryWrapper<ChatSession> wrapper = Wrappers.lambdaQuery(ChatSession.class)
                .eq(ChatSession::getBuyerId, buyerId)
                .eq(ChatSession::getSellerId, sellerId)
                .eq(ChatSession::getProductId, productId);
        return Optional.ofNullable(selectOne(wrapper));
    }

    default Optional<ChatSession> findByBuyerIdAndSellerIdAndProductIdIsNull(Long buyerId, Long sellerId) {
        if (buyerId == null || sellerId == null) {
            return Optional.empty();
        }
        LambdaQueryWrapper<ChatSession> wrapper = Wrappers.lambdaQuery(ChatSession.class)
                .eq(ChatSession::getBuyerId, buyerId)
                .eq(ChatSession::getSellerId, sellerId)
                .isNull(ChatSession::getProductId);
        return Optional.ofNullable(selectOne(wrapper));
    }

    default int update(ChatSession session) {
        return updateById(session);
    }
}
