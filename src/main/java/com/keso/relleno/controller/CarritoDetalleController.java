package com.keso.relleno.controller;

import com.keso.relleno.model.CarritoDetalle;
import com.keso.relleno.service.CarritoDetalleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carrito-detalles")
public class CarritoDetalleController {

    private final CarritoDetalleService service;

    public CarritoDetalleController(
            CarritoDetalleService service
    ) {
        this.service = service;
    }

    @GetMapping
    public List<CarritoDetalle> obtenerTodos() {
        return service.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarritoDetalle> obtenerPorId(
            @PathVariable Long id
    ) {

        return service.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public CarritoDetalle crear(
            @RequestBody CarritoDetalle detalle
    ) {
        return service.guardar(detalle);
    }

    @PutMapping("/{id}")
    public CarritoDetalle actualizar(
            @PathVariable Long id,
            @RequestBody CarritoDetalle detalle
    ) {
        return service.actualizar(id, detalle);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id
    ) {

        service.eliminar(id);

        return ResponseEntity.noContent().build();
    }
}