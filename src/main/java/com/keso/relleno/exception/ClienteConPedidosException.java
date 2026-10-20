package com.keso.relleno.exception;

/**
 * Se lanza cuando se intenta eliminar un cliente que ya tiene ventas (pedidos).
 * No se permite borrarlo porque se perdería su historial de compras: la relación
 * Cliente -> Venta es en cascada, así que un delete arrastraría las ventas.
 */
public class ClienteConPedidosException extends RuntimeException {
    public ClienteConPedidosException(Long id) {
        super("No se puede eliminar al cliente con id " + id
                + " porque tiene pedidos registrados");
    }
}
