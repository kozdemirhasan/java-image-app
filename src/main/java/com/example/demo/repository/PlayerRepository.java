package com.example.demo.repository;

import com.example.demo.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    // Özel sorgular buraya eklenebilir
} 