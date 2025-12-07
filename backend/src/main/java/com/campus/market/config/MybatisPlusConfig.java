package com.campus.market.config;

import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        // 暂不注册具体 InnerInterceptor，先保证编译与运行正常；
        // 如需更精细的分页/多租户等功能，可在此处按需追加。
        return new MybatisPlusInterceptor();
    }
}
