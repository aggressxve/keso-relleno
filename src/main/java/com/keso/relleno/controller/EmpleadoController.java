package com.keso.relleno.controller;


import com.keso.relleno.exception.EmpleadoNotFoundException;
import com.keso.relleno.model.Empleado;
import com.keso.relleno.service.EmpleadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Empleado> crearEmpleado(@RequestBody Empleado newEmpleado) {
        Empleado empleadoByCorreo =empleadoService.findByCorreo(newEmpleado.getCorreo());

        if(empleadoByCorreo != null){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(empleadoByCorreo);
        }else{
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(empleadoService.crearEmpleado(newEmpleado));
        }
    }

    // Mapeo actualizarEmpleado()
    @PutMapping("/editar-empleado/{id}")
    public ResponseEntity<Empleado> actualizarEmpleado(@RequestBody Empleado empleado, @PathVariable Long id){
        try {
            Empleado empleadoActualizado = empleadoService.actualizarEmpleado(empleado, id);
            return ResponseEntity.ok(empleadoActualizado);
        }catch (EmpleadoNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Mapeo eliminarEmpleado()
    @DeleteMapping("/eliminar-empleado/{id}")
    public ResponseEntity<Void> eliminarEmpleado(@PathVariable Long id){
        try{
            empleadoService.eliminarEmpleadoId(id);
            return ResponseEntity.noContent().build();
        }catch (EmpleadoNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
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
