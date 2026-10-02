package com.keso.relleno.dto;

public record LoginRequest(
        String correo,
        String contrasena
) {
}
