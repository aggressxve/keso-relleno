package com.keso.relleno.repository;

import com.keso.relleno.model.CarritoDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoDetalleRepository
        extends JpaRepository<CarritoDetalle, Long> {

    // Buscar todos los detalles de un carrito aca los Items
    List<CarritoDetalle> findByCarritoIdCarrito(Long idCarrito);

    // Buscar si un pastel ya existe en un carrito
    Optional<CarritoDetalle> findByCarritoIdCarritoAndPastelIdPastel(Long idCarrito, Long idPastel);
}