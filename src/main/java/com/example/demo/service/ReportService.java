package com.example.demo.service;

import com.example.demo.model.Player;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;

@Service
public class ReportService {

    @Autowired
    private PlayerService playerService;

    public byte[] generatePlayerReport(Player player) throws Exception {
        // JasperReport şablonunu yükle
        File file = ResourceUtils.getFile("classpath:reports/player_report.jrxml");
        JasperReport jasperReport = JasperCompileManager.compileReport(file.getAbsolutePath());

        // Veri kaynağını hazırla
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(Collections.singletonList(player));

        // Parametreleri hazırla
        HashMap<String, Object> parameters = new HashMap<>();
        
        // Oyuncu resmini parametre olarak ekle
        if (player.getProfileImage() != null) {
            InputStream imageStream = new ByteArrayInputStream(player.getProfileImage());
            parameters.put("PLAYER_IMAGE", imageStream);
        }

        // Raporu doldur
        JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

        // PDF olarak dönüştür
        return JasperExportManager.exportReportToPdf(jasperPrint);
    }
} 