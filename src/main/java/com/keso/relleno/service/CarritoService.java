package com.keso.relleno.service;

import com.keso.relleno.model.Carrito;
import com.keso.relleno.repository.CarritoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;

    public CarritoService(CarritoRepository carritoRepository) {
        this.carritoRepository = carritoRepository;
    }

    public List<Carrito> obtenerTodos() {
        return carritoRepository.findAll();
    }

    public Optional<Carrito> obtenerPorId(Long id) {
        return carritoRepository.findById(id);
    }

    public Carrito guardar(Carrito carrito) {
        return carritoRepository.save(carrito);
    }

    public Carrito actualizar(Long id, Carrito carritoActualizado) {

        Carrito carrito = carritoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Carrito no encontrado con id: " + id
                        )
                );

        carrito.setCliente(carritoActualizado.getCliente());
        carrito.setEstado(carritoActualizado.getEstado());

        return carritoRepository.save(carrito);
    }

    public void eliminar(Long id) {

        if (!carritoRepository.existsById(id)) {
            throw new RuntimeException(
                    "Carrito no encontrado con id: " + id
            );
        }

        carritoRepository.deleteById(id);
    }
}