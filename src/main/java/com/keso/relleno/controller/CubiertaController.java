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
        return ResponseEntity.status(HttpStatus.CREATED).body(cubiertaService.createCubierta(cubierta));
    }
}