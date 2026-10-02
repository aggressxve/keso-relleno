package com.keso.relleno.controller;

import com.keso.relleno.model.Cliente;
import com.keso.relleno.repository.ClienteRepository;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/clientes")
public class ClienteAuthController {

    private final ClienteRepository clienteRepository;

    public ClienteAuthController(
            ClienteRepository clienteRepository
    ) {
        this.clienteRepository =
                clienteRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(
            Authentication authentication
    ) {

        Cliente cliente =
                clienteRepository
                        .findByCorreo(
                                authentication.getName()
                        );

        return ResponseEntity.ok(
                Map.of(
                        "idCliente",
                        cliente.getIdCliente(),
                        "nombre",
                        cliente.getNombre(),
                        "correo",
                        cliente.getCorreo()
                )
        );
    }
}