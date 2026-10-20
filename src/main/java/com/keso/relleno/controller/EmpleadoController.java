package com.keso.relleno.controller;


import com.keso.relleno.exception.EmpleadoNotFoundException;
import com.keso.relleno.dto.EmpleadoUpdateRequest;
import com.keso.relleno.model.Empleado;
import com.keso.relleno.service.EmpleadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;

@RestController
@RequestMapping("api/v1")
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    @Autowired
    public EmpleadoController(EmpleadoService empleadoService) {
        this.empleadoService = empleadoService;
    }

    // Mapeo de mostrarEmpleados()
    @GetMapping("/empleados")
    public List<Empleado> mostrarEmpleados() {
        return empleadoService.mostrarEmpleados();
    }

    // Mapeo de mostrarEmpleadoPorId()
    @GetMapping("/empleado/{id}")
    public ResponseEntity<Empleado> mostrarEmpleadoPorId(@PathVariable Long id){
        try{
            return ResponseEntity.ok(empleadoService.mostrarEmpleadoPorId(id));
        }catch(EmpleadoNotFoundException e){
            return ResponseEntity.notFound().build();
        }
    }

    // Mapeo de crearEmpleado()
    @PostMapping("/crear-empleado")
    public ResponseEntity<?> crearEmpleado(@RequestBody Empleado newEmpleado) {
        if (newEmpleado == null
                || newEmpleado.getNombre() == null || newEmpleado.getNombre().isBlank()
                || newEmpleado.getCorreo() == null || newEmpleado.getCorreo().isBlank()
                || newEmpleado.getContrasena() == null
                || newEmpleado.getRol() == null || newEmpleado.getRol().getIdRol() == null) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "Nombre, correo, contraseña y perfil son obligatorios."));
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(empleadoService.crearEmpleado(newEmpleado));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().startsWith("Ya existe")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(java.util.Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of(
                            "error",
                            "No se pudo guardar el empleado por una restricción de la base de datos."
                    ));
        }
    }

    // Mapeo actualizarEmpleado()
    @PutMapping("/editar-empleado/{id}")
    public ResponseEntity<?> actualizarEmpleado(
            @Valid @RequestBody EmpleadoUpdateRequest empleado,
            @PathVariable Long id,
            Authentication authentication
    ){
        try {
            Empleado empleadoActualizado = empleadoService.actualizarEmpleado(
                    empleado,
                    id,
                    authentication.getName()
            );
            return ResponseEntity.ok(empleadoActualizado);
        }catch (EmpleadoNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Mapeo eliminarEmpleado()
    @DeleteMapping("/eliminar-empleado/{id}")
    public ResponseEntity<?> eliminarEmpleado(
            @PathVariable Long id,
            Authentication authentication
    ){
        try{
            empleadoService.eliminarEmpleadoId(id, authentication.getName());
            return ResponseEntity.noContent().build();
        }catch (EmpleadoNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Mapeo mostrarEmpleadoPorCorreo()
    @GetMapping("/empleado-correo")
    public ResponseEntity<Empleado> mostrarEmpleadoPorCorreo(@RequestParam String correo) {
        Empleado empleadoCorreo =  empleadoService.findByCorreo(correo);
        if(empleadoCorreo != null){
            return ResponseEntity.ok(empleadoCorreo);
        }else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }


}
