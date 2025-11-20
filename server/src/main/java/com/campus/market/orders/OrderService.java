package com.campus.market.orders;

import com.campus.market.chat.ChatService;
import com.campus.market.products.Product;
import com.campus.market.products.ProductRepository;
import com.campus.market.users.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ChatService chatService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        ChatService chatService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.chatService = chatService;
    }

    public Order create(Long buyerId, CreateOrderDto dto) {
        Product p = productRepository.findById(dto.productId())
                .orElseThrow(() -> new RuntimeException("商品不存在"));
        if (p.getSellerId().equals(buyerId)) {
            throw new RuntimeException("不能购买自己的商品");
        }
        int qty = Math.max(1, dto.quantity());
        BigDecimal total = p.getPrice().multiply(BigDecimal.valueOf(qty));

        Order o = new Order();
        o.setBuyerId(buyerId);
        o.setSellerId(p.getSellerId());
        o.setProductId(p.getId());
        o.setQuantity(qty);
        o.setPriceTotal(total);
        o.setPaymentMethod(PaymentMethod.OFFLINE);
        o.setShippingMethod(dto.shippingMethod());
        o.setShippingAddress(dto.shippingAddress());
        o.setStatus(OrderStatus.CREATED);
        // snapshots
        o.setTitleSnapshot(p.getTitle());
        o.setCoverSnapshot(p.getImages().stream().findFirst().map(img -> img.getUrl()).orElse(null));
        o.setPriceSnapshot(p.getPrice());
        o.setCreatedAt(Instant.now());
        o.setUpdatedAt(Instant.now());
        Order saved = orderRepository.save(o);

        // notify via chat
        try {
            chatService.openConversation(buyerId, p.getSellerId());
            var threadConv = chatService.openConversation(p.getSellerId(), buyerId);
            String content = "下单通知：" + o.getTitleSnapshot() + " x" + o.getQuantity() + ", 请尽快发货或联系买家。";
            chatService.sendMessage(buyerId, threadConv.getThreadId(), p.getSellerId(), content);
        } catch (Exception ignored) {}

        return saved;
    }

    public Page<Order> myOrders(Long userId, String role, OrderStatus status, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        if ("seller".equalsIgnoreCase(role)) {
            return status == null ? orderRepository.findBySellerId(userId, pageable) : orderRepository.findBySellerIdAndStatus(userId, status, pageable);
        }
        return status == null ? orderRepository.findByBuyerId(userId, pageable) : orderRepository.findByBuyerIdAndStatus(userId, status, pageable);
    }

    public Order ship(Long sellerId, Long id, ShipDto dto) {
        Order o = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("订单不存在"));
        if (!o.getSellerId().equals(sellerId)) throw new RuntimeException("无权操作");
        if (o.getStatus() != OrderStatus.CREATED) throw new RuntimeException("状态不允许发货");
        o.setLogisticsCompany(dto.logisticsCompany());
        o.setTrackingNumber(dto.trackingNumber());
        o.setStatus(OrderStatus.SHIPPED);
        o.setUpdatedAt(Instant.now());
        Order saved = orderRepository.save(o);
        try {
            chatService.openConversation(sellerId, o.getBuyerId());
            var conv = chatService.openConversation(o.getBuyerId(), sellerId);
            String content = "发货通知：订单" + o.getId() + " 已发货。";
            chatService.sendMessage(sellerId, conv.getThreadId(), o.getBuyerId(), content);
        } catch (Exception ignored) {}
        return saved;
    }

    public Order confirmReceipt(Long buyerId, Long id) {
        Order o = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("订单不存在"));
        if (!o.getBuyerId().equals(buyerId)) throw new RuntimeException("无权操作");
        if (o.getStatus() != OrderStatus.SHIPPED) throw new RuntimeException("状态不允许确认收货");
        o.setStatus(OrderStatus.COMPLETED);
        o.setUpdatedAt(Instant.now());
        Order saved = orderRepository.save(o);
        try {
            chatService.openConversation(buyerId, o.getSellerId());
            var conv = chatService.openConversation(o.getSellerId(), buyerId);
            String content = "收货确认：订单" + o.getId() + " 已确认收货，交易完成。";
            chatService.sendMessage(buyerId, conv.getThreadId(), o.getSellerId(), content);
        } catch (Exception ignored) {}
        return saved;
    }

    public Order cancel(Long userId, Long id) {
        Order o = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("订单不存在"));
        if (!o.getBuyerId().equals(userId) && !o.getSellerId().equals(userId)) throw new RuntimeException("无权操作");
        if (o.getStatus() != OrderStatus.CREATED) throw new RuntimeException("状态不允许取消");
        o.setStatus(OrderStatus.CANCELLED);
        o.setUpdatedAt(Instant.now());
        return orderRepository.save(o);
    }

    // DTOs
    public record CreateOrderDto(Long productId, Integer quantity, ShippingMethod shippingMethod, String shippingAddress) {}
    public record ShipDto(String logisticsCompany, String trackingNumber) {}
}



