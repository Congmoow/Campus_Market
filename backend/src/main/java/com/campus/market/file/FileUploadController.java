package com.campus.market.file;

import com.campus.market.common.api.ApiResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * 通用文件上传接口
     * @param file 文件
     * @param type 文件类型: avatars(头像), products(商品图片), chat(聊天图片)，默认 products
     */
    @PostMapping("/api/files/upload")
    public ApiResponse<UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", required = false, defaultValue = "products") String type
    ) throws IOException {
        String url = fileStorageService.store(file, type);
        return ApiResponse.ok(new UploadResponse(url));
    }
}
