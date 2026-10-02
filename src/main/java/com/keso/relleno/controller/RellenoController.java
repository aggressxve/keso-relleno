package com.keso.relleno.controller;

import com.keso.relleno.model.Relleno;
import com.keso.relleno.service.RellenoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rellenos")
public class RellenoController {

    private final RellenoService rellenoService;

    public RellenoController(RellenoService rellenoService) {
        this.rellenoService = rellenoService;
    }

    @GetMapping
    public List<Relleno> listar() {
        return rellenoService.obtenerTodos();
    }

    @PostMapping
    public ResponseEntity<Relleno> crear(@RequestBody Relleno relleno) {
        if (relleno == null
                || relleno.getIdRelleno() != null
                || relleno.getSaborRelleno() == null
                || relleno.getSaborRelleno().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        relleno.setSaborRelleno(relleno.getSaborRelleno().trim());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(rellenoService.guardar(relleno));
    }
}
