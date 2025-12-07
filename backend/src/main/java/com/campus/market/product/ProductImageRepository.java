package com.campus.market.product;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ProductImageRepository extends BaseMapper<ProductImage> {

    default List<ProductImage> findByProductIdOrderBySortOrderAsc(Long productId) {
        if (productId == null) {
            return List.of();
        }
        LambdaQueryWrapper<ProductImage> wrapper = Wrappers.lambdaQuery(ProductImage.class)
                .eq(ProductImage::getProductId, productId)
                .orderByAsc(ProductImage::getSortOrder, ProductImage::getId);
        return selectList(wrapper);
    }

    default int deleteByProductId(Long productId) {
        if (productId == null) {
            return 0;
        }
        LambdaQueryWrapper<ProductImage> wrapper = Wrappers.lambdaQuery(ProductImage.class)
                .eq(ProductImage::getProductId, productId);
        return delete(wrapper);
    }

    // insert 方法由 BaseMapper 提供，无需重写
}
