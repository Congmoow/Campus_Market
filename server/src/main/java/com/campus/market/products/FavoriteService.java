package com.campus.market.products;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class FavoriteService {

    private final JdbcTemplate jdbcTemplate;

    public FavoriteService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void toggleFavorite(long userId, long productId) {
        Integer count = jdbcTemplate.queryForObject("select count(*) from favorites where user_id=? and product_id=?", Integer.class, userId, productId);
        if (count != null && count > 0) {
            jdbcTemplate.update("delete from favorites where user_id=? and product_id=?", userId, productId);
            jdbcTemplate.update("update products set favorites = greatest(favorites-1,0) where id=?", productId);
        } else {
            jdbcTemplate.update("insert into favorites(user_id, product_id) values(?,?)", userId, productId);
            jdbcTemplate.update("update products set favorites = favorites+1 where id=?", productId);
        }
    }

    public boolean isFavorited(long userId, long productId) {
        Integer count = jdbcTemplate.queryForObject("select count(*) from favorites where user_id=? and product_id=?", Integer.class, userId, productId);
        return count != null && count > 0;
    }
}
