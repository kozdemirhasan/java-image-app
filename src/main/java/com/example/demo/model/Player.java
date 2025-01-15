package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

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
    private LocalDate birthDate;
    
    @NotBlank(message = "Pozisyon boş olamaz")
    private String position;
    
    private Integer jerseyNumber;
    
    @NotBlank(message = "Uyruk boş olamaz")
    private String nationality;
    
    private Double height;
    private Double weight;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] profileImage;
    
    private String imageContentType;
} 