package com.campus.market.users;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        Long userId = currentUserId(principal);
        return userRepository.findById(userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(Principal principal, @RequestBody UpdateUserDto body) {
        Long userId = currentUserId(principal);
        return userRepository.findById(userId)
                .map(u -> {
                    if (body.nickname != null) u.setNickname(body.nickname);
                    if (body.campus != null) u.setCampus(body.campus);
                    if (body.phone != null) u.setPhone(body.phone);
                    if (body.avatar != null) u.setAvatar(body.avatar);
                    if (body.coverImage != null) u.setCoverImage(body.coverImage);
                    userRepository.save(u);
                    return ResponseEntity.ok(u);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private Long currentUserId(Principal principal) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登录");
        try {
            return Long.parseLong(principal.getName());
        } catch (NumberFormatException e) {
            return userRepository.findByUsername(principal.getName())
                    .map(User::getId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登录"));
        }
    }

    public static class UpdateUserDto {
        public String nickname;
        public String campus;
        public String phone;
        public String avatar;
        public String coverImage;
    }
}
