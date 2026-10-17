package com.keso.relleno.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Datos para editar un empleado desde el panel administrativo. */
public record EmpleadoUpdateRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        String correo,

        @NotNull(message = "El perfil es obligatorio")
        Long idRol,

        @NotNull(message = "El estado es obligatorio")
        Boolean activo,

        // Opcional: si viene vacío, se conserva la contraseña actual
        String contrasena
) {
}
