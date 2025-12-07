package com.campus.market.order;

import com.campus.market.common.api.ApiResponse;
import com.campus.market.common.exception.BusinessException;
import com.campus.market.order.dto.CreateOrderRequest;
import com.campus.market.order.dto.OrderDto;
import com.campus.market.user.User;
import com.campus.market.user.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    private User requireUser(Principal principal) {
        if (principal == null) {
            throw new BusinessException("未登录");
        }
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BusinessException("用户不存在"));
    }

    /**
     * 创建订单（确认订单页提交）。
     */
    @PostMapping("/orders")
    public ApiResponse<OrderDto> create(@RequestBody CreateOrderRequest request,
                                        Principal principal) {
        User user = requireUser(principal);
        return ApiResponse.ok(orderService.createOrder(user.getId(), request));
    }

    /**
     * 当前用户的订单列表（我买到的 / 我卖出的）。
     */
    @GetMapping("/orders/me")
    public ApiResponse<List<OrderDto>> myOrders(@RequestParam(required = false) String role,
                                                @RequestParam(required = false) String status,
                                                Principal principal) {
        User user = requireUser(principal);
        return ApiResponse.ok(orderService.listMyOrders(user.getId(), role, status));
    }

    /**
     * 查询订单详情。
     */
    @GetMapping("/orders/{id}")
    public ApiResponse<OrderDto> detail(@PathVariable Long id,
                                        Principal principal) {
        User user = requireUser(principal);
        return ApiResponse.ok(orderService.getOrderDetail(user.getId(), id));
    }

    /**
     * 买家确认收货。
     */
    @PostMapping("/orders/{id}/confirm")
    public ApiResponse<OrderDto> confirm(@PathVariable Long id,
                                         Principal principal) {
        User user = requireUser(principal);
        return ApiResponse.ok(orderService.confirmReceive(user.getId(), id));
    }

    /**
     * 卖家发货。
     */
    @PostMapping("/orders/{id}/ship")
    public ApiResponse<OrderDto> ship(@PathVariable Long id,
                                      Principal principal) {
        User user = requireUser(principal);
        return ApiResponse.ok(orderService.shipOrder(user.getId(), id));
    }
}
