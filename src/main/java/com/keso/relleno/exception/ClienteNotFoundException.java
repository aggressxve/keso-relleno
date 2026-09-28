package com.keso.relleno.exception;

public class ClienteNotFoundException extends RuntimeException {
    public ClienteNotFoundException(Long id) {
        super("No se encontró un cliente con el id: " + id);
    }
}
