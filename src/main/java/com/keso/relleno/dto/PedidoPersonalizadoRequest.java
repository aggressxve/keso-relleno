package com.keso.relleno.dto;

import java.time.LocalDate;

// Datos que manda el formulario de pedido personalizado.
// Es un DTO (y no la entidad) para que el cliente no pueda mandar a la fuerza
// el id de un cliente o de una dirección ajena: eso lo decide el servidor.
public record PedidoPersonalizadoRequest(
        String nombre,
        String correo,
        String telefono,
        String bizcocho,
        String relleno,
        String cobertura,
        Integer personas,
        LocalDate fecha,
        String entrega,       // "domicilio" o "tienda"
        String descripcion,
        String direccion,     // solo se usa si es domicilio
        String ciudad,        // solo se usa si es domicilio
        String codigoPostal   // solo se usa si es domicilio
) {}