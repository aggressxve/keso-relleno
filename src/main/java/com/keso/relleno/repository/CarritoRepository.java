package com.keso.relleno.repository;

import com.keso.relleno.model.Carrito;
import com.keso.relleno.model.EstadoCarrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoRepository
        extends JpaRepository<Carrito, Long> {

    // Buscar el carrito activo de un cliente
    Optional<Carrito> findByClienteIdClienteAndEstado(Long idCliente, EstadoCarrito estado);

    // Buscar todos los carritos de un cliente
    List<Carrito> findByClienteIdCliente(Long idCliente);
}