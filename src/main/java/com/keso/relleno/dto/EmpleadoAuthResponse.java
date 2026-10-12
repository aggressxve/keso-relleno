package com.keso.relleno.dto;

public record EmpleadoAuthResponse(
        String token,
        Long idEmpleado,
        String nombre,
        String correo,
        String rol
) {
}
