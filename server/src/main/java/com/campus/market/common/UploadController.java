package com.campus.market.common;

import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
public class UploadController {

  private static final Path ROOT = Paths.get("uploads");

  @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String, Object> upload(@RequestPart("file") MultipartFile file) throws IOException {
    if (file.isEmpty()) {
      throw new IllegalArgumentException("empty file");
    }
    if (!Files.exists(ROOT)) {
      Files.createDirectories(ROOT);
    }
    String dateDir = LocalDate.now().toString();
    Path dir = ROOT.resolve(dateDir);
    if (!Files.exists(dir)) {
      Files.createDirectories(dir);
    }
    String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
    String filename = UUID.randomUUID().toString().replaceAll("-", "");
    String finalName = ext == null || ext.isEmpty() ? filename : (filename + "." + ext.toLowerCase());
    Path target = dir.resolve(finalName);
    if (!Files.exists(target.getParent())) {
      Files.createDirectories(target.getParent());
    }
    Files.copy(file.getInputStream(), target);
    String url = "/uploads/" + dateDir + "/" + finalName;
    Map<String, Object> resp = new HashMap<>();
    resp.put("url", url);
    return resp;
  }
}



