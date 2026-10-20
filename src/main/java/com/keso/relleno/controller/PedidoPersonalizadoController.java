package com.keso.relleno.controller;

import com.keso.relleno.model.PedidoPersonalizado;
import com.keso.relleno.service.PedidoPersonalizadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.keso.relleno.dto.PedidoPersonalizadoRequest;
import org.springframework.security.core.Authentication;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoPersonalizadoController {
    private final PedidoPersonalizadoService pedidoService;

    @Autowired
    public PedidoPersonalizadoController(PedidoPersonalizadoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<?> createPedido(@RequestBody PedidoPersonalizadoRequest request,
                                          Authentication authentication) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(pedidoService.createPedido(request, authentication));
        } catch (IllegalArgumentException e) {
            // Errores de validación: el formulario muestra este mensaje
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
