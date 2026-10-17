package com.keso.relleno.dto;

import jakarta.validation.constraints.NotBlank;

/** Datos para iniciar sesión como cliente. */
public record LoginRequest(
        @NotBlank(message = "El correo es obligatorio")
        String correo,

        @NotBlank(message = "La contraseña es obligatoria")
        String contrasena
) {
}
