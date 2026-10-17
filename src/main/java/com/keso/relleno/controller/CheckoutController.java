package com.keso.relleno.controller;

import com.keso.relleno.dto.CheckoutRequest;
import com.keso.relleno.model.Venta;
import com.keso.relleno.service.CheckoutService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    // Registra la compra del cliente con sesión iniciada
    @PostMapping
    public ResponseEntity<?> pagar(@Valid @RequestBody CheckoutRequest request, Authentication authentication) {
        // Las @Valid de arriba (y las del DTO) ya rechazan datos incompletos con 400.
        // El service sigue validando reglas de negocio (stock, fecha, zona de entrega...).
        List<Venta> ventas = checkoutService.procesar(request, authentication);
        // Se devuelven solo los ids (no las entidades completas) para evitar problemas de serialización
        return ResponseEntity.ok(Map.of(
                "mensaje", "Compra registrada",
                "ventas", ventas.stream().map(Venta::getIdVenta).toList()
        ));
    }
}
