package com.example.demo.service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.model.Player;
import com.example.demo.repository.PlayerRepository;

@Service
public class PlayerService {

    @Autowired
    private PlayerRepository playerRepository;
    
    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }
    
    public Player getPlayerById(Long id) {
        return playerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Oyuncu bulunamadı"));
    }
    
    public Player savePlayer(Player player, MultipartFile image) throws IOException {
        if (image != null && !image.isEmpty()) {
            player.setProfileImage(image.getBytes());
            player.setImageContentType(image.getContentType());
        }
        return playerRepository.save(player);
    }
    
    public void deletePlayer(Long id) {
        playerRepository.deleteById(id);
    }
} 