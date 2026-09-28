package com.keso.relleno.controller;

import com.keso.relleno.exceptions.RolNoEncontradoException;
import com.keso.relleno.model.Rol;
import com.keso.relleno.service.RolService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/roles")
public class RolController {
    private final RolService rolService;

    public RolController(RolService rolService) {
        this.rolService = rolService;
    }

    @GetMapping
    public List<Rol> obtenerTodosRoles() {
        return rolService.todosLosRoles();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rol> obtenerRolPorId(@PathVariable Long id) {
        try {
            Rol idRol = rolService.encontrarRolPorId(id);
            return ResponseEntity.ok(idRol);
        } catch (RolNoEncontradoException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/crear-rol")
    public ResponseEntity<Rol> crearRol(@RequestBody Rol nuevoRol) {
        Rol rol = rolService.crearRol(nuevoRol);
        return ResponseEntity.ok(rol);
    }
}
