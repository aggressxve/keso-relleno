package com.keso.relleno.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

// Datos que manda el front al pagar
public record CheckoutRequest(
        String tipoEntrega,      // "domicilio" o "tienda"
        String direccion,        // solo se usa si es domicilio
        LocalDate fechaEntrega,  // ej. 2026-10-20
        LocalTime horaEntrega,   // ej. 14:30
        List<Item> items         // pasteles del carrito
) {
    // Solo id y cantidad: el precio NUNCA viene del front
    public record Item(Long pastelId, Integer cantidad) {}
}