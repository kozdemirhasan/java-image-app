package com.example.demo.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "players")
public class Player {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "İsim boş olamaz")
    private String name;
    
    @NotNull(message = "Doğum tarihi boş olamaz")
    @Column(name = "birth_date")
    private LocalDate birthDate;
    
    @NotBlank(message = "Pozisyon boş olamaz")
    private String position;
    
    private Integer jerseyNumber;
    
    @NotBlank(message = "Uyruk boş olamaz")
    private String nationality;
    
    private Double height;
    private Double weight;
    
    @Lob
    @Column(name = "profile_image", columnDefinition = "LONGBLOB")
    private byte[] profileImage;
    
    @Column(name = "image_content_type")
    private String imageContentType;
} 