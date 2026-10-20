package com.keso.relleno.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Datos que el front manda para registrar un cliente.
 * Las anotaciones de jakarta.validation se ejecutan cuando el controller
 * recibe el @RequestBody con @Valid: si algo falla, ni siquiera entra al service.
 */
public record RegistroRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 3, max = 255, message = "El nombre debe tener entre 3 y 255 caracteres")
        String nombre,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 255, message = "El correo es demasiado largo")
        String correo,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = "\\d{10}", message = "El teléfono debe tener 10 dígitos")
        String telefono,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String contrasena
) {
}
