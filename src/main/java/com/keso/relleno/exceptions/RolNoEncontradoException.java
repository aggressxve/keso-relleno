package com.keso.relleno.exceptions;

public class RolNoEncontradoException extends RuntimeException {
    public RolNoEncontradoException(String message, Long id) {
        super(message);
        System.out.println("Id " + id + "  no encontrado");
    }
}
