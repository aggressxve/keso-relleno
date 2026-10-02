package com.keso.relleno.controller;

import com.keso.relleno.model.Cubierta;
import com.keso.relleno.service.CubiertaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cubiertas")
public class CubiertaController {

    private final CubiertaService cubiertaService;

    @Autowired
    public CubiertaController(CubiertaService cubiertaService) {
        this.cubiertaService = cubiertaService;
    }

    @GetMapping
    public List<Cubierta> getCubiertas() {
        return cubiertaService.getCubiertas();
    }

    @PostMapping
    public ResponseEntity<Cubierta> createCubierta(@RequestBody Cubierta cubierta) {
        if (cubierta == null
                || cubierta.getIdCubierta() != null
                || cubierta.getSaborCubierta() == null
                || cubierta.getSaborCubierta().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        cubierta.setSaborCubierta(cubierta.getSaborCubierta().trim());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cubiertaService.createCubierta(cubierta));
    }
}