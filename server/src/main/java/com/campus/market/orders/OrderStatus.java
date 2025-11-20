package com.campus.market.orders;

public enum OrderStatus {
    CREATED, // 待发货/待取货
    SHIPPED, // 卖家已发货/待取货
    RECEIVED, // 买家已收货（可选中间态）
    COMPLETED, // 完成
    CANCELLED // 取消
}



