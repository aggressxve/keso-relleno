package com.keso.relleno.repository;

import com.keso.relleno.model.CarritoDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarritoDetalleRepository
        extends JpaRepository<CarritoDetalle, Long> {
}