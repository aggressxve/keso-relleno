package com.keso.relleno.controller;

import com.keso.relleno.model.Topping;
import com.keso.relleno.service.ToppingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/toppings")
public class ToppingController {

    @Autowired
    private ToppingService toppingService;

    @GetMapping
    public List<Topping> listar() {
        return toppingService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Topping> obtenerPorId(@PathVariable Long id) {
        return toppingService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Topping crear(@RequestBody Topping topping) {
        return toppingService.guardar(topping);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Topping> actualizar(@PathVariable Long id, @RequestBody Topping topping) {
        return toppingService.actualizar(id, topping)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!toppingService.eliminar(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
