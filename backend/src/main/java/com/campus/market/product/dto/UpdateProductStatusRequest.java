package com.campus.market.product.dto;

/**
 * 更新商品状态请求体。
 *
 * status 常见取值：ON_SALE / SOLD / DELETED。
 */
public class UpdateProductStatusRequest {

    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
