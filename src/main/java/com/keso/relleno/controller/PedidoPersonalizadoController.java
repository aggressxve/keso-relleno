package com.keso.relleno.controller;

import com.keso.relleno.model.PedidoPersonalizado;
import com.keso.relleno.service.PedidoPersonalizadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<PedidoPersonalizado> createPedido(@RequestBody PedidoPersonalizado pedido) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.createPedido(pedido));
    }
}
