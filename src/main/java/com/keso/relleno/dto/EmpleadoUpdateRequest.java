package com.keso.relleno.dto;

public record EmpleadoUpdateRequest(
        String nombre,
        String correo,
        Long idRol,
        Boolean activo,
        String contrasena
) {
}
