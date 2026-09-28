package com.keso.relleno.service;

import com.keso.relleno.model.CarritoDetalle;
import com.keso.relleno.repository.CarritoDetalleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CarritoDetalleService {

    private final CarritoDetalleRepository repository;

    public CarritoDetalleService(
            CarritoDetalleRepository repository
    ) {
        this.repository = repository;
    }

    public List<CarritoDetalle> obtenerTodos() {
        return repository.findAll();
    }

    public Optional<CarritoDetalle> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public CarritoDetalle guardar(
            CarritoDetalle detalle
    ) {
        return repository.save(detalle);
    }

    public CarritoDetalle actualizar(
            Long id,
            CarritoDetalle detalleActualizado
    ) {

        CarritoDetalle detalle = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Detalle no encontrado con id: " + id
                        )
                );

        detalle.setCarrito(
                detalleActualizado.getCarrito()
        );

        detalle.setPastel(
                detalleActualizado.getPastel()
        );

        detalle.setCantidad(
                detalleActualizado.getCantidad()
        );

        detalle.setPrecioUnitario(
                detalleActualizado.getPrecioUnitario()
        );

        return repository.save(detalle);
    }

    public void eliminar(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Detalle no encontrado con id: " + id
            );
        }

        repository.deleteById(id);
    }
}