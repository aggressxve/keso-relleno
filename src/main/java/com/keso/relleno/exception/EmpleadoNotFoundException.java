package com.keso.relleno.exception;

public class EmpleadoNotFoundException extends RuntimeException {
    public EmpleadoNotFoundException(Long id) {
        super("No se encontró un empleado con el id: " + id);
    }
}
