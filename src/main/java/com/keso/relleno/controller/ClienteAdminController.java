package com.keso.relleno.controller;

import com.keso.relleno.service.ClienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
public class ClienteAdminController {

    private final ClienteService clienteService;

    public ClienteAdminController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    // Solo los datos que necesita la tabla del panel (sin contraseñas ni relaciones circulares)
    @GetMapping
    public List<Map<String, Object>> listar() {
        return clienteService.listarResumen();
    }

    // Botón "Eliminar" del panel. Si el cliente tiene pedidos, el service lanza
    // ClienteConPedidosException -> 409 (el front ya muestra ese aviso).
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        clienteService.eliminarClienteDesdePanel(id);
        return ResponseEntity.noContent().build();
    }
}
