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

    @PostMapping("/api/files/upload")
    public ApiResponse<UploadResponse> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String url = fileStorageService.store(file);
        return ApiResponse.ok(new UploadResponse(url));
    }
}
