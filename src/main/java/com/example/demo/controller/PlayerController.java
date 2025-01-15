package com.example.demo.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.model.Player;
import com.example.demo.service.PlayerService;
import com.example.demo.service.ReportService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = "http://localhost:3000")
public class PlayerController {

    @Autowired
    private PlayerService playerService;

    @Autowired
    private ReportService reportService;

    @GetMapping
    public List<Player> getAllPlayers() {
        return playerService.getAllPlayers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Player> getPlayer(@PathVariable Long id) {
        return ResponseEntity.ok(playerService.getPlayerById(id));
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getPlayerImage(@PathVariable Long id) {
        Player player = playerService.getPlayerById(id);
        if (player.getProfileImage() == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(player.getImageContentType()))
                .body(player.getProfileImage());
    }

    @PostMapping
    public ResponseEntity<Player> createPlayer(
            @Valid @RequestParam("player") String playerJson,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        Player player = mapper.readValue(playerJson, Player.class);
        return new ResponseEntity<>(playerService.savePlayer(player, image), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Player> updatePlayer(
            @PathVariable Long id,
            @RequestParam("player") String playerJson,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        Player player = mapper.readValue(playerJson, Player.class);
        player.setId(id);
        return ResponseEntity.ok(playerService.savePlayer(player, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable Long id) {
        playerService.deletePlayer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<byte[]> generateReport(@PathVariable Long id) {
        try {
            Player player = playerService.getPlayerById(id);
            byte[] reportBytes = reportService.generatePlayerReport(player);
            
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=player_" + id + ".pdf")
                    .body(reportBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 