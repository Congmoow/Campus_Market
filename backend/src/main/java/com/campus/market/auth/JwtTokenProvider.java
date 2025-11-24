package com.campus.market.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${security.jwt.expiration-ms:604800000}") // 默认7天
    private long validityInMs;

    @Value("${security.jwt.secret}")
    private String secret;

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
