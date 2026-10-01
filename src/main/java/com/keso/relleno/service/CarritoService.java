package com.keso.relleno.service;

import com.keso.relleno.exception.CarritoNotFoundException;
import com.keso.relleno.model.*;
import com.keso.relleno.repository.CarritoDetalleRepository;
import com.keso.relleno.repository.CarritoRepository;
import com.keso.relleno.repository.PastelRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final CarritoDetalleRepository carritoDetalleRepository;
    private final PastelRepository pastelRepository;

    public CarritoService(
            CarritoRepository carritoRepository,
            CarritoDetalleRepository carritoDetalleRepository,
            PastelRepository pastelRepository
    ) {
        this.carritoRepository = carritoRepository;
        this.carritoDetalleRepository = carritoDetalleRepository;
        this.pastelRepository = pastelRepository;
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
                .orElseThrow(() -> new CarritoNotFoundException(id));

        carrito.setCliente(carritoActualizado.getCliente());
        carrito.setEstado(carritoActualizado.getEstado());

        return carritoRepository.save(carrito);
    }

    public void eliminar(Long id) {

        if (!carritoRepository.existsById(id)) {
            throw new CarritoNotFoundException(id);
        }

        carritoRepository.deleteById(id);
    }

    // logica de negocio

    // 1. Obtener carrito activo de un cliente
    public Carrito obtenerCarritoActivo(Long clienteId) {

        return carritoRepository
                .findByClienteIdClienteAndEstado(clienteId, EstadoCarrito.ACTIVO)
                .orElseGet(() -> {
                    Carrito nuevoCarrito = new Carrito();
                    Cliente cliente = new Cliente();
                    cliente.setIdCliente(clienteId);
                    nuevoCarrito.setCliente(cliente);
                    nuevoCarrito.setEstado(EstadoCarrito.ACTIVO);
                    return carritoRepository.save(nuevoCarrito);
                });
    }

    // 2. Agregar item al carrito (se va sumando si ya existe)
    public CarritoDetalle agregarItem(
            Long carritoId,
            Long pastelId,
            int cantidad,
            BigDecimal precioUnitario
    ) {

        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new CarritoNotFoundException(carritoId));

        Pastel pastel = pastelRepository.findById(pastelId)
                .orElseThrow(() -> new RuntimeException(
                        "Pastel no encontrado con id: " + pastelId
                ));

        // pastel ya en carrito...
        Optional<CarritoDetalle> detalleExistente = carritoDetalleRepository
                .findByCarritoIdCarritoAndPastelIdPastel(carritoId, pastelId);

        if (detalleExistente.isPresent()) {
            CarritoDetalle detalle = detalleExistente.get();
            detalle.setCantidad(detalle.getCantidad() + cantidad);
            return carritoDetalleRepository.save(detalle);
        } else {
            CarritoDetalle nuevoDetalle = new CarritoDetalle();
            nuevoDetalle.setCarrito(carrito);
            nuevoDetalle.setPastel(pastel);
            nuevoDetalle.setCantidad(cantidad);
            nuevoDetalle.setPrecioUnitario(precioUnitario);
            return carritoDetalleRepository.save(nuevoDetalle);
        }
    }

    // 3. Actualizar cantidad de un item
    public CarritoDetalle actualizarCantidad(
            Long carritoId,
            Long detalleId,
            int nuevaCantidad
    ) {

        CarritoDetalle detalle = carritoDetalleRepository.findById(detalleId)
                .orElseThrow(() -> new RuntimeException(
                        "Detalle no encontrado con id: " + detalleId
                ));

        if (nuevaCantidad <= 0) {
            carritoDetalleRepository.delete(detalle);
            return null;
        }

        detalle.setCantidad(nuevaCantidad);
        return carritoDetalleRepository.save(detalle);
    }

    // 4. Eliminar un item del carrito
    public void eliminarItem(Long carritoId, Long detalleId) {

        CarritoDetalle detalle = carritoDetalleRepository.findById(detalleId)
                .orElseThrow(() -> new RuntimeException(
                        "Detalle no encontrado con id: " + detalleId
                ));

        carritoDetalleRepository.delete(detalle);
    }

    // 5. Vaciar carrito
    public void vaciarCarrito(Long carritoId) {

        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new CarritoNotFoundException(carritoId));

        List<CarritoDetalle> detalles = carritoDetalleRepository
                .findByCarritoIdCarrito(carritoId);

        carritoDetalleRepository.deleteAll(detalles);
    }

    // 6. Calcular total del carrito
    public BigDecimal calcularTotal(Long carritoId) {

        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new CarritoNotFoundException(carritoId));

        List<CarritoDetalle> detalles = carritoDetalleRepository
                .findByCarritoIdCarrito(carritoId);

        return detalles.stream()
                .map(d -> d.getPrecioUnitario()
                        .multiply(BigDecimal.valueOf(d.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // 7. Checkout
    public Carrito checkout(Long carritoId) {

        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new CarritoNotFoundException(carritoId));

        if (carrito.getEstado() != EstadoCarrito.ACTIVO) {
            throw new RuntimeException(
                    "Solo se puede hacer checkout de un carrito ACTIVO"
            );
        }

        if (carrito.getDetalles().isEmpty()) {
            throw new RuntimeException(
                    "No se puede hacer checkout de un carrito vacío"
            );
        }

        carrito.setEstado(EstadoCarrito.COMPLETADO);
        return carritoRepository.save(carrito);
    }
}
