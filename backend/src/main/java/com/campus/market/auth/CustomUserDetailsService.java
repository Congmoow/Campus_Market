package com.campus.market.auth;

import com.campus.market.user.User;
import com.campus.market.user.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

/**
 * Spring Security 用户详情服务实现。
 *
 * 负责根据用户名从数据库加载用户信息，并转换为 UserDetails 对象
 * 供 Spring Security 在认证和授权过程中使用。
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 根据用户名从数据库查询用户，不存在则抛出 UsernameNotFoundException，由 Spring Security 统一处理
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在"));

        // 根据用户角色拼接成 ROLE_xxx 形式的权限集合，供权限判断使用
        Collection<? extends GrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));

        // 使用 Spring Security 提供的 User 对象包装账号、密码、启用状态和权限等信息
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                user.getEnabled(),
                true,
                true,
                true,
                authorities
        );
    }
}
