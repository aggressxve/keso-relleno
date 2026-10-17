package com.keso.relleno.controller;

import com.keso.relleno.model.Cliente;
import com.keso.relleno.service.ClienteService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/clientes")
public class ClienteAuthController {

    private final ClienteService clienteService;

    public ClienteAuthController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        // Si nadie inició sesión, no hay nada que devolver (antes daba NullPointerException)
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Cliente cliente = clienteService.findByCorreo(authentication.getName());
        if (cliente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(
                Map.of(
                        "idCliente", cliente.getIdCliente(),
                        "nombre", cliente.getNombre(),
                        "correo", cliente.getCorreo()
                )
        );
    }
}
