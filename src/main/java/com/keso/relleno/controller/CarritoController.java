package com.keso.relleno.controller;

import com.keso.relleno.model.Carrito;
import com.keso.relleno.service.CarritoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carritos")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    @GetMapping
    public List<Carrito> obtenerTodos() {
        return carritoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Carrito> obtenerPorId(
            @PathVariable Long id
    ) {

        return carritoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Carrito crear(
            @RequestBody Carrito carrito
    ) {
        return carritoService.guardar(carrito);
    }

    @PutMapping("/{id}")
    public Carrito actualizar(
            @PathVariable Long id,
            @RequestBody Carrito carrito
    ) {
        return carritoService.actualizar(id, carrito);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id
    ) {

        carritoService.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}