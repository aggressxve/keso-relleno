package com.keso.relleno.controller;

import com.keso.relleno.model.Cliente;
import com.keso.relleno.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ClienteController {
    private final ClienteService clienteService;

    @Autowired
    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    //se mapea getCliente
    @GetMapping("/clientes")
    public List<Cliente> getClientes(){
        return clienteService.getCliente();
    }

    //se mapea createCliente
    @PostMapping("/create-cliente")
    public ResponseEntity<Cliente> createCliente(@RequestBody Cliente newCliente){

        if (clienteService.findByCorreo(newCliente.getCorreo()).isPresent()){
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }

        if (clienteService.findByTelefono(newCliente.getTelefono()).isPresent()){
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clienteService.createCliente(newCliente));
    }
}
