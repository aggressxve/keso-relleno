package com.keso.relleno.dto;

public record RegistroRequest(
        String nombre,
        String correo,
        String telefono,
        String contrasena
) {
}
