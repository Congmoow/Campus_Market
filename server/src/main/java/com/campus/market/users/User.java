package com.campus.market.users;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@ToString
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String phone;
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    private String nickname;
    private String role;   // STUDENT / ADMIN
    private String status; // ACTIVE / BANNED
    private String campus;
    private String avatar;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}


