package com.keso.relleno.controller;

import com.keso.relleno.model.Pan;
import com.keso.relleno.service.PanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/panes")
public class PanController {

    @Autowired
    private PanService panService;

    @GetMapping
    public List<Pan> listar() {
        return panService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pan> obtenerPorId(@PathVariable Long id) {
        return panService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Pan> crear(@RequestBody Pan pan) {
        if (pan == null
                || pan.getIdPan() != null
                || pan.getNombre() == null
                || pan.getNombre().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        pan.setNombre(pan.getNombre().trim());
        return ResponseEntity.ok(panService.guardar(pan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pan> actualizar(@PathVariable Long id, @RequestBody Pan pan) {
        return panService.actualizar(id, pan)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!panService.eliminar(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}