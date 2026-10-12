package com.keso.relleno.dto;

public record EmpleadoLoginRequest(
        String correo,
        String contrasena
) {
}
