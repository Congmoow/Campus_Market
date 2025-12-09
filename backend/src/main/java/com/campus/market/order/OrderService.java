package com.campus.market.order;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.campus.market.chat.ChatService;
import com.campus.market.common.exception.BusinessException;
import com.campus.market.order.dto.CreateOrderRequest;
import com.campus.market.order.dto.OrderDto;
import com.campus.market.product.Product;
import com.campus.market.product.ProductImage;
import com.campus.market.product.ProductImageRepository;
import com.campus.market.product.ProductRepository;
import com.campus.market.user.UserProfile;
import com.campus.market.user.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 订单领域服务。
 *
 * 负责处理与订单相关的业务逻辑：
 * - 创建订单（校验商品状态、买卖双方信息等）
 * - 卖家发货、买家确认收货
 * - 查询当前用户的订单列表和订单详情
 *
 * 同时会通过 ChatService 发送与订单相关的系统消息，方便买卖双方在聊天中同步状态。
 */
@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final UserProfileRepository userProfileRepository;
    private final ChatService chatService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        ProductImageRepository productImageRepository,
                        UserProfileRepository userProfileRepository,
                        ChatService chatService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.userProfileRepository = userProfileRepository;
        this.chatService = chatService;
    }

    /**
     * 创建订单：当前登录用户作为买家，根据商品 ID 生成订单。
     */
    public OrderDto createOrder(Long buyerId, CreateOrderRequest request) {
        // 基础参数校验：必须已登录且携带 productId
        if (buyerId == null) {
            throw new BusinessException("未登录");
        }
        if (request == null || request.getProductId() == null) {
            throw new BusinessException("productId 不能为空");
        }

        // 查询商品并校验是否存在
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("商品不存在"));

        // 不允许购买自己的商品
        if (Objects.equals(product.getSellerId(), buyerId)) {
            throw new BusinessException("不能购买自己的商品");
        }
        // 仅当商品处于 ON_SALE（在售）状态时才允许下单
        if (!"ON_SALE".equals(product.getStatus())) {
            throw new BusinessException("该商品当前不可购买");
        }

        // 构造订单实体，将当前价格、地点等信息拍成快照
        OrderEntity order = new OrderEntity();
        order.setBuyerId(buyerId);
        order.setSellerId(product.getSellerId());
        order.setProductId(product.getId());
        order.setPriceSnapshot(product.getPrice());
        order.setMeetLocation(product.getLocation());
        // meetTime 暂时为空，后续可支持预约时间

        order.prePersist();
        orderRepository.insert(order);

        chatService.sendOrderEventMessage(order.getBuyerId(), order.getSellerId(), order.getProductId(), order.getBuyerId(), "我已拍下该商品，请尽快发货～");

        return toDto(order);
    }

    /**
     * 卖家标记已发货，将订单状态标记为 SHIPPED。
     */
    public OrderDto shipOrder(Long userId, Long orderId) {
        if (userId == null) {
            throw new BusinessException("未登录");
        }
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("订单不存在"));

        if (!Objects.equals(order.getSellerId(), userId)) {
            throw new BusinessException("只有卖家可以发货");
        }
        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("当前订单状态不可发货");
        }

        order.setStatus("SHIPPED");
        order.preUpdate();
        orderRepository.update(order);

        chatService.sendOrderEventMessage(order.getBuyerId(), order.getSellerId(), order.getProductId(), order.getSellerId(), "我已发货，请注意查收～");

        return toDto(order);
    }

    /**
     * 买家确认收货，将订单状态标记为 DONE。
     */
    public OrderDto confirmReceive(Long userId, Long orderId) {
        if (userId == null) {
            throw new BusinessException("未登录");
        }
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("订单不存在"));

        if (!Objects.equals(order.getBuyerId(), userId)) {
            throw new BusinessException("只有买家可以确认收货");
        }
        if (!"PENDING".equals(order.getStatus()) && !"SHIPPED".equals(order.getStatus())) {
            throw new BusinessException("当前订单状态不可确认收货");
        }

        order.setStatus("DONE");
        order.preUpdate();
        orderRepository.update(order);

        // 同步更新商品状态为已售出，避免继续展示在最新发布列表中
        Product product = productRepository.findById(order.getProductId()).orElse(null);
        if (product != null && (product.getStatus() == null || !"SOLD".equals(product.getStatus()))) {
            product.setStatus("SOLD");
            productRepository.update(product);
        }

        chatService.sendOrderEventMessage(order.getBuyerId(), order.getSellerId(), order.getProductId(), order.getBuyerId(), "我已确认收货，本次交易已完成～");

        return toDto(order);
    }

    /**
     * 获取当前用户的订单列表（买到的或卖出的），可按状态筛选。
     */
    @Transactional(readOnly = true)
    public List<OrderDto> listMyOrders(Long userId, String role, String status) {
        if (userId == null) {
            throw new BusinessException("未登录");
        }

        String roleUpper = role != null ? role.toUpperCase() : "BUY";
        String statusFilter = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status))
                ? status.toUpperCase()
                : null;

        QueryWrapper<OrderEntity> wrapper = new QueryWrapper<>();
        if ("SELL".equals(roleUpper)) {
            wrapper.eq("seller_id", userId);
        } else {
            wrapper.eq("buyer_id", userId);
        }
        if (statusFilter != null) {
            wrapper.eq("status", statusFilter);
        }
        wrapper.orderByDesc("created_at", "id");

        List<OrderEntity> orders = orderRepository.selectList(wrapper);

        return orders.stream().map(this::toDto).collect(Collectors.toList());
    }

    /**
     * 查询订单详情，只有买家或卖家本人可以查看。
     */
    @Transactional(readOnly = true)
    public OrderDto getOrderDetail(Long currentUserId, Long orderId) {
        if (currentUserId == null) {
            throw new BusinessException("未登录");
        }
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("订单不存在"));

        if (!Objects.equals(order.getBuyerId(), currentUserId)
                && !Objects.equals(order.getSellerId(), currentUserId)) {
            throw new BusinessException("无权查看该订单");
        }

        return toDto(order);
    }

    private OrderDto toDto(OrderEntity order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus());
        dto.setProductId(order.getProductId());
        dto.setPrice(order.getPriceSnapshot());
        dto.setMeetLocation(order.getMeetLocation());
        dto.setMeetTime(order.getMeetTime());
        dto.setCreatedAt(order.getCreatedAt());

        // 商品信息快照
        Product product = productRepository.findById(order.getProductId()).orElse(null);
        if (product != null) {
            dto.setProductTitle(product.getTitle());
            List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(product.getId());
            if (!images.isEmpty()) {
                dto.setProductImage(images.get(0).getUrl());
            }
        }

        // 买家信息
        dto.setBuyerId(order.getBuyerId());
        UserProfile buyerProfile = userProfileRepository.findByUserId(order.getBuyerId()).orElse(null);
        if (buyerProfile != null) {
            dto.setBuyerName(buyerProfile.getNickname());
            dto.setBuyerAvatar(buyerProfile.getAvatarUrl());
        }

        // 卖家信息
        dto.setSellerId(order.getSellerId());
        UserProfile sellerProfile = userProfileRepository.findByUserId(order.getSellerId()).orElse(null);
        if (sellerProfile != null) {
            dto.setSellerName(sellerProfile.getNickname());
            dto.setSellerAvatar(sellerProfile.getAvatarUrl());
        }

        return dto;
    }
}
