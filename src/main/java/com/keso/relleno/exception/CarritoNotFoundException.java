package com.keso.relleno.exception;

public class CarritoNotFoundException extends RuntimeException {
    public CarritoNotFoundException(Long id) {
        super("No se encontró un carrito con el id: " + id);
    }
}
