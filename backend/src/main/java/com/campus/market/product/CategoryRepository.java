package com.campus.market.product;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CategoryRepository extends BaseMapper<Category> {

    default Optional<Category> findById(Long id) {
        return Optional.ofNullable(selectById(id));
    }

    default Category findByName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        LambdaQueryWrapper<Category> wrapper = Wrappers.lambdaQuery(Category.class)
                .eq(Category::getName, name);
        return selectOne(wrapper);
    }

    default List<Category> findAll() {
        return selectList(null);
    }

    // insert 方法由 BaseMapper 提供，无需重写
}
