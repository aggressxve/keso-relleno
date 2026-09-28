package com.keso.relleno.controller;

import com.keso.relleno.model.Credencial;
import com.keso.relleno.service.CredencialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/credenciales")
public class CredencialController {

    private final CredencialService service;

    public CredencialController(
            CredencialService service
    ) {
        this.service = service;
    }

    @GetMapping
    public List<Credencial> obtenerTodos() {
        return service.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Credencial> obtenerPorId(
            @PathVariable Long id
    ) {

        return service.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Credencial crear(
            @RequestBody Credencial credencial
    ) {
        return service.guardar(credencial);
    }

    @PutMapping("/{id}")
    public Credencial actualizar(
            @PathVariable Long id,
            @RequestBody Credencial credencial
    ) {
        return service.actualizar(id, credencial);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id
    ) {

        service.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}