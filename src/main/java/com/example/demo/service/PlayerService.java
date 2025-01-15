package com.example.demo.service;

import com.example.demo.model.Player;
import com.example.demo.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

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
    
    public Player savePlayer(Player player, MultipartFile imageFile) throws IOException {
        if (imageFile != null && !imageFile.isEmpty()) {
            player.setProfileImage(imageFile.getBytes());
            player.setImageContentType(imageFile.getContentType());
        }
        return playerRepository.save(player);
    }
    
    public void deletePlayer(Long id) {
        playerRepository.deleteById(id);
    }
} 