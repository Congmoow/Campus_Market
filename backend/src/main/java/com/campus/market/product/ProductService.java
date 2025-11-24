package com.campus.market.product;

import com.campus.market.common.exception.BusinessException;
import com.campus.market.product.dto.CategoryDto;
import com.campus.market.product.dto.CreateProductRequest;
import com.campus.market.product.dto.ProductDto;
import com.campus.market.product.dto.ProductListItemDto;
import com.campus.market.product.dto.UpdateProductRequest;
import com.campus.market.user.UserProfile;
import com.campus.market.user.UserProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final UserProfileRepository userProfileRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          ProductImageRepository productImageRepository,
                          UserProfileRepository userProfileRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productImageRepository = productImageRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductListItemDto> getLatest(int limit) {
        List<Product> products = productRepository.findTop8ByStatusOrderByCreatedAtDesc("ON_SALE");
        if (limit < products.size()) {
            products = products.subList(0, limit);
        }
        return products.stream().map(this::toListItemDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductListItemDto> list(Long categoryId, String keyword, String sort, int page, int size) {
        Pageable pageable;
        if ("priceAsc".equalsIgnoreCase(sort)) {
            pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "price"));
        } else if ("priceDesc".equalsIgnoreCase(sort)) {
            pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "price"));
        } else {
            pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        Page<Product> productPage;
        boolean hasCategory = categoryId != null && categoryId > 0;
        boolean hasKeyword = keyword != null && !keyword.isBlank();

        if (hasCategory && hasKeyword) {
            productPage = productRepository.findByCategoryIdAndTitleContainingIgnoreCase(categoryId, keyword, pageable);
        } else if (hasCategory) {
            productPage = productRepository.findByCategoryId(categoryId, pageable);
        } else if (hasKeyword) {
            productPage = productRepository.findByTitleContainingIgnoreCase(keyword, pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }

        return productPage.map(this::toListItemDto);
    }

    @Transactional(readOnly = true)
    public ProductDto getDetail(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("商品不存在"));
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setTitle(product.getTitle());
        dto.setPrice(product.getPrice());
        dto.setOriginalPrice(product.getOriginalPrice());
        dto.setDescription(product.getDescription());
        dto.setCategoryId(product.getCategoryId());
        dto.setStatus(product.getStatus());
        dto.setLocation(product.getLocation());
        dto.setCreatedAt(product.getCreatedAt());

        if (product.getCategoryId() != null) {
            Optional<Category> categoryOpt = categoryRepository.findById(product.getCategoryId());
            categoryOpt.ifPresent(category -> dto.setCategoryName(category.getName()));
        }

        List<String> images = productImageRepository.findByProductIdOrderBySortOrderAsc(product.getId())
                .stream().map(ProductImage::getUrl).collect(Collectors.toList());
        dto.setImages(images);

        dto.setSellerId(product.getSellerId());
        if (product.getSellerId() != null) {
            UserProfile profile = userProfileRepository.findByUserId(product.getSellerId()).orElse(null);
            if (profile != null) {
                dto.setSellerName(profile.getNickname());
                dto.setSellerAvatar(profile.getAvatarUrl());
            }
        }

        return dto;
    }

    public ProductDto createProduct(Long sellerId, CreateProductRequest request) {
        if (sellerId == null) {
            throw new BusinessException("未登录");
        }

        Product product = new Product();
        product.setSellerId(sellerId);
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setLocation(request.getLocation());
        product.setStatus("ON_SALE");
        
        // 显式设置时间，防止 @PrePersist 失效导致数据库报错
        LocalDateTime now = LocalDateTime.now();
        product.setCreatedAt(now);
        product.setUpdatedAt(now);

        Long categoryId = request.getCategoryId();
        if (categoryId == null && request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
            Category category = categoryRepository.findByName(request.getCategoryName());
            if (category == null) {
                category = new Category();
                category.setName(request.getCategoryName());
                category = categoryRepository.save(category);
            }
            categoryId = category.getId();
        }
        product.setCategoryId(categoryId);

        product = productRepository.save(product);

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            int sort = 0;
            for (String url : request.getImageUrls()) {
                if (url == null || url.isBlank()) continue;
                ProductImage image = new ProductImage();
                image.setProductId(product.getId());
                image.setUrl(url);
                image.setSortOrder(sort++);
                productImageRepository.save(image);
            }
        }

        return getDetail(product.getId());
    }

    public ProductDto updateProduct(Long id, Long sellerId, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("商品不存在"));

        if (!Objects.equals(product.getSellerId(), sellerId)) {
            throw new BusinessException("无权操作该商品");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            product.setTitle(request.getTitle());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getOriginalPrice() != null) {
            product.setOriginalPrice(request.getOriginalPrice());
        }

        Long categoryId = request.getCategoryId();
        if (categoryId == null && request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
            Category category = categoryRepository.findByName(request.getCategoryName());
            if (category == null) {
                category = new Category();
                category.setName(request.getCategoryName());
                category = categoryRepository.save(category);
            }
            categoryId = category.getId();
        }
        if (categoryId != null) {
            product.setCategoryId(categoryId);
        }

        if (request.getLocation() != null) {
            product.setLocation(request.getLocation());
        }

        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);

        if (request.getImageUrls() != null) {
            productImageRepository.deleteByProductId(product.getId());
            int sort = 0;
            for (String url : request.getImageUrls()) {
                if (url == null || url.isBlank()) continue;
                ProductImage image = new ProductImage();
                image.setProductId(product.getId());
                image.setUrl(url);
                image.setSortOrder(sort++);
                productImageRepository.save(image);
            }
        }

        return getDetail(id);
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryDto(c.getId(), c.getName()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductListItemDto> listBySeller(Long sellerId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> productPage;
        if (status != null && !status.isBlank()) {
            productPage = productRepository.findBySellerIdAndStatus(sellerId, status, pageable);
        } else {
            productPage = productRepository.findBySellerId(sellerId, pageable);
        }
        return productPage.map(this::toListItemDto);
    }

    public ProductDto updateStatus(Long id, Long sellerId, String status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("商品不存在"));

        if (!Objects.equals(product.getSellerId(), sellerId)) {
            throw new BusinessException("无权操作该商品");
        }

        if (!"ON_SALE".equals(status) && !"SOLD".equals(status) && !"DELETED".equals(status)) {
            throw new BusinessException("不支持的商品状态");
        }

        product.setStatus(status);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);

        return getDetail(id);
    }

    public void softDeleteProduct(Long id, Long sellerId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("商品不存在"));

        if (!Objects.equals(product.getSellerId(), sellerId)) {
            throw new BusinessException("无权操作该商品");
        }

        product.setStatus("DELETED");
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    public ProductListItemDto toListItemDto(Product product) {
        ProductListItemDto dto = new ProductListItemDto();
        dto.setId(product.getId());
        dto.setTitle(product.getTitle());
        dto.setPrice(product.getPrice());
        dto.setLocation(product.getLocation());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setStatus(product.getStatus());

        List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(product.getId());
        if (!images.isEmpty()) {
            dto.setThumbnail(images.get(0).getUrl());
        }

        dto.setSellerId(product.getSellerId());
        if (product.getSellerId() != null) {
            UserProfile profile = userProfileRepository.findByUserId(product.getSellerId()).orElse(null);
            if (profile != null) {
                dto.setSellerName(profile.getNickname());
                dto.setSellerAvatar(profile.getAvatarUrl());
            }
        }

        return dto;
    }
}
