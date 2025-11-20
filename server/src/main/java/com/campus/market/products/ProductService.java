package com.campus.market.products;

import com.campus.market.products.dto.ProductCreateDto;
import com.campus.market.products.dto.ProductDetailDto;
import com.campus.market.products.dto.ProductUpdateStatusDto;
import com.campus.market.users.User;
import com.campus.market.users.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository,
                          UserRepository userRepository,
                          CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public Product create(long sellerId, ProductCreateDto dto) {
        Product p = new Product();
        p.setSellerId(sellerId);
        p.setTitle(dto.getTitle());
        p.setDescription(dto.getDescription());
        p.setPrice(dto.getPrice());
        p.setCondition(dto.getCondition());
        p.setCategoryId(dto.getCategoryId());
        p.setCampus(dto.getCampus());
        p.setStatus("ACTIVE");
        p.setViews(0);
        p.setFavorites(0);
        p.setCreatedAt(Instant.now());
        p.setUpdatedAt(Instant.now());

        var images = new ArrayList<ProductImage>();
        int idx = 0;
        for (String url : dto.getImages()) {
            ProductImage img = new ProductImage();
            img.setUrl(url);
            img.setSortOrder(idx++);
            img.setProduct(p);
            images.add(img);
        }
        p.setImages(images);

        return productRepository.save(p);
    }

    @Transactional
    public ProductDetailDto getDetail(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("商品不存在"));

        int currentViews = Optional.ofNullable(product.getViews()).orElse(0);
        product.setViews(currentViews + 1);

        User seller = userRepository.findById(product.getSellerId()).orElse(null);
        String categoryName = null;
        if (product.getCategoryId() != null) {
            categoryName = categoryRepository.findById(product.getCategoryId())
                    .map(Category::getName)
                    .orElse(null);
        }

        return ProductMapper.toDetail(product, seller, categoryName);
    }

    @Transactional
    public Product updateStatus(long sellerId, Long productId, String status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("商品不存在"));
        if (!product.getSellerId().equals(sellerId)) {
            throw new IllegalArgumentException("无权操作该商品");
        }
        product.setStatus(status);
        product.setUpdatedAt(Instant.now());
        return productRepository.save(product);
    }
}


