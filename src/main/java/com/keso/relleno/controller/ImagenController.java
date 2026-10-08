package com.keso.relleno.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/imagenes")
public class ImagenController {

    private static final Path CARPETA = Paths.get("uploads", "pasteles");
    private static final Map<String, String> TIPOS = Map.of(
            "image/png", ".png",
            "image/jpeg", ".jpg",
            "image/webp", ".webp"
    );

    @PostMapping
    public ResponseEntity<Map<String, String>> subir(@RequestParam("archivo") MultipartFile archivo) throws IOException {
        String extension = TIPOS.get(archivo.getContentType());
        if (archivo.isEmpty() || extension == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Sube una imagen PNG, JPG o WEBP"));
        }
        Files.createDirectories(CARPETA);
        String nombre = UUID.randomUUID() + extension;
        try (InputStream in = archivo.getInputStream()) {
            Files.copy(in, CARPETA.resolve(nombre));
        }
        return ResponseEntity.ok(Map.of("urlFoto", "/uploads/pasteles/" + nombre));
    }
}
