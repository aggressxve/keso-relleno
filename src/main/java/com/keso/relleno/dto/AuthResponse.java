package com.keso.relleno.dto;

public record AuthResponse(
        String token,
        Long idCliente,
        String nombre,
        String correo
) {
}
