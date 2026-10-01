package com.keso.relleno.controller;


import com.keso.relleno.model.Pastel;
import com.keso.relleno.service.PastelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pasteles")
public class PastelController {

    @Autowired
    private PastelService pastelService;

    @GetMapping
    public List<Pastel> listar() {
        return pastelService.obtenerTodos();
    }

    @PostMapping("/create-pastel")
    public Pastel crear(@RequestBody Pastel pastel) {
        return pastelService.guardar(pastel);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!pastelService.eliminar(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pastel> obtenerPorId(
            @PathVariable Long id
    ) {

        return pastelService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pastel> actualizar(
            @PathVariable Long id,
            @RequestBody Pastel pastel
    ) {
        return pastelService.actualizar(id, pastel)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
