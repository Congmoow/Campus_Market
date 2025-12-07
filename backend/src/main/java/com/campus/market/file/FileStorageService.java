package com.campus.market.file;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir;
    
    // 允许的文件类型分类
    private static final Set<String> ALLOWED_TYPES = Set.of("avatars", "products", "chat");

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) throws IOException {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
    }

    /**
     * 存储文件到指定类型的子目录
     * @param file 上传的文件
     * @param type 文件类型: avatars(头像), products(商品图片), chat(聊天图片)
     * @return 文件访问 URL
     */
    public String store(MultipartFile file, String type) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件为空");
        }
        
        // 验证类型，默认存到 products
        if (type == null || !ALLOWED_TYPES.contains(type)) {
            type = "products";
        }

        // 确保子目录存在
        Path typeDir = uploadDir.resolve(type);
        Files.createDirectories(typeDir);

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf('.'));
        }
        String filename = UUID.randomUUID() + ext;
        Path target = typeDir.resolve(filename);

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + type + "/" + filename;
    }
    
    /**
     * 存储文件（默认存到 products 目录）
     */
    public String store(MultipartFile file) throws IOException {
        return store(file, "products");
    }
}
