package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Bu kullanıcı adı zaten kullanılıyor");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Bu email adresi zaten kullanılıyor");
        }
        
        try {
            String hashedPassword = passwordEncoder.encode(user.getPassword());
            user.setPassword(hashedPassword);
            
            User savedUser = userRepository.save(user);
            
            Authentication auth = new UsernamePasswordAuthenticationToken(
                savedUser.getUsername(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            
            return savedUser;
        } catch (Exception e) {
            throw new RuntimeException("Kayıt işlemi sırasında bir hata oluştu: " + e.getMessage());
        }
    }

    public User login(String username, String password) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
                    
            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new RuntimeException("Hatalı şifre");
            }
            
            Authentication auth = new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            
            return user;
        } catch (Exception e) {
            throw new RuntimeException("Giriş işlemi sırasında bir hata oluştu: " + e.getMessage());
        }
    }
} 