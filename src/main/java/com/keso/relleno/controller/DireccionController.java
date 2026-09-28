package com.keso.relleno.controller;

import com.keso.relleno.exception.DireccionNotFoundException;
import com.keso.relleno.model.Direccion;
import com.keso.relleno.service.DireccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1")
public class DireccionController {

    private final DireccionService direccionService;

    @Autowired
    public DireccionController(DireccionService direccionService) {
        this.direccionService = direccionService;
    }

    // Mapeo de mostrarDirecciones()
    @GetMapping("/direcciones")
    public List<Direccion> mostrarDirecciones() {
        return direccionService.mostrarDirecciones();
    }

    // Mapeo de mostrarDireccionPorId()
    @GetMapping("/direccion/{id}")
    public ResponseEntity<Direccion> mostrarDireccionPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(direccionService.mostrarDireccionPorId(id));
        } catch (DireccionNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Mapeo de crearDireccion()
    @PostMapping("/crear-direccion")
    public ResponseEntity<Direccion> crearDireccion(@RequestBody Direccion nuevaDireccion) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(direccionService.crearDireccion(nuevaDireccion));
    }

    // Mapeo actualizarDireccion()
    @PutMapping("/editar-direccion/{id}")
    public ResponseEntity<Direccion> actualizarDireccion(
            @RequestBody Direccion direccion,
            @PathVariable Long id) {
        try {
            Direccion direccionActualizada =
                    direccionService.actualizarDireccion(direccion, id);
            return ResponseEntity.ok(direccionActualizada);
        } catch (DireccionNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Mapeo eliminarDireccion()
    @DeleteMapping("/eliminar-direccion/{id}")
    public ResponseEntity<Void> eliminarDireccion(@PathVariable Long id) {
        try {
            direccionService.eliminarDireccionId(id);
            return ResponseEntity.noContent().build();
        } catch (DireccionNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}