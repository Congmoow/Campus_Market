package com.campus.market.order;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface OrderRepository extends BaseMapper<OrderEntity> {

    default Optional<OrderEntity> findById(Long id) {
        return Optional.ofNullable(selectById(id));
    }

    default int update(OrderEntity order) {
        return updateById(order);
    }
}
