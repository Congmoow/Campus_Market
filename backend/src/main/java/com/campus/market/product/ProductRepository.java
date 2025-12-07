package com.campus.market.product;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Mapper
public interface ProductRepository extends BaseMapper<Product> {

    default Optional<Product> findById(Long id) {
        return Optional.ofNullable(selectById(id));
    }

    default List<Product> findAllById(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }
        return selectBatchIds(ids);
    }

    default int update(Product product) {
        return updateById(product);
    }
}
