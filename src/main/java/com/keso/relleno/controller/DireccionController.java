package com.keso.relleno.controller;

import com.keso.relleno.exception.DireccionNotFoundException;
import com.keso.relleno.model.Direccion;
import com.keso.relleno.service.DireccionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    public List<Direccion> mostrarDirecciones(Authentication authentication) {
        return direccionService.mostrarDirecciones(authentication);
    }

    // Mapeo de mostrarDireccionPorId()
    @GetMapping("/direccion/{id}")
    public ResponseEntity<Direccion> mostrarDireccionPorId(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            return ResponseEntity.ok(direccionService.mostrarDireccionPorId(id, authentication));
        } catch (DireccionNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Mapeo de crearDireccion()
    @PostMapping("/crear-direccion")
    public ResponseEntity<Direccion> crearDireccion(
            @RequestBody Direccion nuevaDireccion,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(direccionService.crearDireccion(nuevaDireccion, authentication));
    }

    // Mapeo actualizarDireccion()
    @PutMapping("/editar-direccion/{id}")
    public ResponseEntity<Direccion> actualizarDireccion(
            @RequestBody Direccion direccion,
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            Direccion direccionActualizada =
                    direccionService.actualizarDireccion(direccion, id, authentication);
            return ResponseEntity.ok(direccionActualizada);
        } catch (DireccionNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Mapeo eliminarDireccion()
    @DeleteMapping("/eliminar-direccion/{id}")
    public ResponseEntity<Void> eliminarDireccion(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            direccionService.eliminarDireccionId(id, authentication);
            return ResponseEntity.noContent().build();
        } catch (DireccionNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}