package com.campus.market.orders;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> create(Principal principal, @RequestBody OrderService.CreateOrderDto dto) {
        Long uid = currentUserId(principal);
        return ResponseEntity.ok(orderService.create(uid, dto));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<Order>> my(Principal principal,
                                          @RequestParam(defaultValue = "buyer") String role,
                                          @RequestParam(required = false) OrderStatus status,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        Long uid = currentUserId(principal);
        return ResponseEntity.ok(orderService.myOrders(uid, role, status, page, size));
    }

    @PutMapping("/{id}/ship")
    public ResponseEntity<?> ship(Principal principal, @PathVariable Long id, @RequestBody OrderService.ShipDto dto) {
        Long uid = currentUserId(principal);
        return ResponseEntity.ok(orderService.ship(uid, id, dto));
    }

    @PutMapping("/{id}/confirm-receipt")
    public ResponseEntity<?> confirm(Principal principal, @PathVariable Long id) {
        Long uid = currentUserId(principal);
        return ResponseEntity.ok(orderService.confirmReceipt(uid, id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(Principal principal, @PathVariable Long id) {
        Long uid = currentUserId(principal);
        return ResponseEntity.ok(orderService.cancel(uid, id));
    }

    private Long currentUserId(Principal principal) {
        if (principal == null) throw new RuntimeException("未登录");
        try {
            return Long.parseLong(principal.getName());
        } catch (NumberFormatException e) {
            throw new RuntimeException("未登录");
        }
    }
}



