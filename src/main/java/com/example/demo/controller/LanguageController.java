package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/language")
@CrossOrigin(origins = "*")
public class LanguageController {

    @Autowired
    private MessageSource messageSource;

    @PostMapping("/change")
    public ResponseEntity<Map<String, String>> changeLanguage(@RequestParam String lang) {
        try {
            Locale locale = new Locale(lang);
            Map<String, String> translations = new HashMap<>();
            
            // Tüm çevirileri ekle
            translations.put("nav.title", messageSource.getMessage("nav.title", null, locale));
            translations.put("nav.welcome", messageSource.getMessage("nav.welcome", null, locale));
            translations.put("nav.logout", messageSource.getMessage("nav.logout", null, locale));
            translations.put("player.title", messageSource.getMessage("player.title", null, locale));
            translations.put("player.add", messageSource.getMessage("player.add", null, locale));
            translations.put("player.name", messageSource.getMessage("player.name", null, locale));
            translations.put("player.birthDate", messageSource.getMessage("player.birthDate", null, locale));
            translations.put("player.position", messageSource.getMessage("player.position", null, locale));
            translations.put("player.jerseyNumber", messageSource.getMessage("player.jerseyNumber", null, locale));
            translations.put("player.nationality", messageSource.getMessage("player.nationality", null, locale));
            translations.put("player.height", messageSource.getMessage("player.height", null, locale));
            translations.put("player.weight", messageSource.getMessage("player.weight", null, locale));
            translations.put("player.image", messageSource.getMessage("player.image", null, locale));
            translations.put("player.actions", messageSource.getMessage("player.actions", null, locale));
            translations.put("player.edit", messageSource.getMessage("player.edit", null, locale));
            translations.put("player.delete", messageSource.getMessage("player.delete", null, locale));
            translations.put("player.print", messageSource.getMessage("player.print", null, locale));
            translations.put("btn.save", messageSource.getMessage("btn.save", null, locale));
            translations.put("btn.cancel", messageSource.getMessage("btn.cancel", null, locale));

            return ResponseEntity.ok(translations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 