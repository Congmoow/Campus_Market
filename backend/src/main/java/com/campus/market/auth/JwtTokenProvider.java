package com.campus.market.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.util.Date;

/**
 * JWT Token 生成与解析工具类。
 *
 * 通过对称密钥（HS256）对 token 进行签名：
 * - createToken：根据用户信息创建带有过期时间的 JWT
 * - parseToken：从 JWT 中解析出声明（Claims），用于后续认证
 */
@Component
public class JwtTokenProvider {

    @Value("${security.jwt.expiration-ms:604800000}") // 过期时间（毫秒），默认 7 天
    private long validityInMs;

    @Value("${security.jwt.secret}")
    private String secret;

    /**
     * 创建 JWT token。
     *
     * @param userId   用户 ID
     * @param username 学号 / 登录名
     * @param role     角色（USER / ADMIN 等）
     * @return 已签名的 JWT 字符串
     */
    public String createToken(Long userId, String username, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityInMs);

        byte[] keyBytes = secret.getBytes();
        SecretKeySpec key = new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("username", username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 解析并验证 JWT token，返回其中的 Claims。
     */
    public Claims parseToken(String token) {
        byte[] keyBytes = secret.getBytes();
        SecretKeySpec key = new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
