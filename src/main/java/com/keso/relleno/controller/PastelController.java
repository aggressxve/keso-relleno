package com.keso.relleno.controller;


import com.keso.relleno.model.Pastel;
import com.keso.relleno.service.PastelService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping
    public Pastel crear(@RequestBody Pastel pastel) {
        return pastelService.guardar(pastel);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        pastelService.eliminar(id);
    }
}
