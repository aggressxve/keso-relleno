package com.keso.relleno.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

// Datos que manda el front al pagar
public record CheckoutRequest(
        @NotBlank(message = "El tipo de entrega es obligatorio")
        String tipoEntrega,      // "domicilio" o "tienda"

        String direccion,        // solo se usa si es domicilio (la valida el service)
        String ciudad,
        String codigoPostal,

        @NotNull(message = "La fecha de entrega es obligatoria")
        @FutureOrPresent(message = "La fecha de entrega no puede ser anterior a hoy")
        LocalDate fechaEntrega,  // ej. 2026-10-20

        @NotNull(message = "La hora de entrega es obligatoria")
        LocalTime horaEntrega,   // ej. 14:30

        @NotEmpty(message = "El carrito no puede estar vacío")
        @Valid
        List<Item> items         // pasteles del carrito
) {
    // Solo id y cantidad: el precio NUNCA viene del front
    public record Item(
            @NotNull(message = "El id del pastel es obligatorio")
            Long pastelId,

            @NotNull(message = "La cantidad es obligatoria")
            @Positive(message = "La cantidad debe ser mayor a cero")
            Integer cantidad
    ) {
    }
}
