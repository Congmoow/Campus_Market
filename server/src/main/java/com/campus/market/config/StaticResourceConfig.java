package com.campus.market.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // 将本地 uploads 目录暴露为 /uploads/** 静态资源
    registry.addResourceHandler("/uploads/**")
        .addResourceLocations("file:uploads/");
  }
}



