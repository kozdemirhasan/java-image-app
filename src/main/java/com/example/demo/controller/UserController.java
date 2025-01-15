package com.example.demo.controller;

import com.example.demo.model.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        // Burada normalde bir service katmanı üzerinden kullanıcı kaydı yapılır
        return ResponseEntity.ok(user);
    }

    @GetMapping("/hello")
    public String hello() {
        return "Merhaba Spring Boot!";
    }
} 