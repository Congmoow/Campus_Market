package com.campus.market.chat;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ChatMessageRepository extends BaseMapper<ChatMessage> {

    default Optional<ChatMessage> findById(Long id) {
        return Optional.ofNullable(selectById(id));
    }

    default List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(Long sessionId) {
        if (sessionId == null) {
            return List.of();
        }
        LambdaQueryWrapper<ChatMessage> wrapper = Wrappers.lambdaQuery(ChatMessage.class)
                .eq(ChatMessage::getSessionId, sessionId)
                .orderByAsc(ChatMessage::getCreatedAt, ChatMessage::getId);
        return selectList(wrapper);
    }

    default long countBySessionIdAndSenderIdNotAndReadFalse(Long sessionId, Long senderId) {
        if (sessionId == null) {
            return 0L;
        }
        LambdaQueryWrapper<ChatMessage> wrapper = Wrappers.lambdaQuery(ChatMessage.class)
                .eq(ChatMessage::getSessionId, sessionId)
                .eq(ChatMessage::getRead, false);
        if (senderId != null) {
            wrapper.ne(ChatMessage::getSenderId, senderId);
        }
        return selectCount(wrapper);
    }

    default int update(ChatMessage message) {
        return updateById(message);
    }
}
