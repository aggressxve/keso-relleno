package com.keso.relleno.service;

import com.keso.relleno.exception.CarritoNotFoundException;
import com.keso.relleno.model.*;
import com.keso.relleno.repository.CarritoDetalleRepository;
import com.keso.relleno.repository.CarritoRepository;
import com.keso.relleno.repository.ClienteRepository;
import com.keso.relleno.repository.PastelRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final CarritoDetalleRepository carritoDetalleRepository;
    private final PastelRepository pastelRepository;
    private final ClienteRepository clienteRepository;

    public CarritoService(
            CarritoRepository carritoRepository,
            CarritoDetalleRepository carritoDetalleRepository,
            PastelRepository pastelRepository,
            ClienteRepository clienteRepository
    ) {
        this.carritoRepository = carritoRepository;
        this.carritoDetalleRepository = carritoDetalleRepository;
        this.pastelRepository = pastelRepository;
        this.clienteRepository = clienteRepository;
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

    // autorizacion

    private Cliente obtenerClienteAutenticado(Authentication authentication) {
        String correo = authentication.getName();
        Cliente cliente = clienteRepository.findByCorreo(correo);
        if (cliente == null) {
            throw new RuntimeException("Cliente autenticado no encontrado");
        }
        return cliente;
    }

    private Carrito obtenerCarritoVerificado(Long carritoId, Authentication authentication) {
        Cliente cliente = obtenerClienteAutenticado(authentication);
        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new CarritoNotFoundException(carritoId));
        if (!carrito.getCliente().getIdCliente().equals(cliente.getIdCliente())) {
            throw new AccessDeniedException("No tienes acceso a este carrito");
        }
        return carrito;
    }

    // logica de negocio

    // 1. Obtener carrito activo del cliente autenticado
    public Carrito obtenerCarritoActivo(Authentication authentication) {
        Cliente cliente = obtenerClienteAutenticado(authentication);
        Long clienteId = cliente.getIdCliente();

        return carritoRepository
                .findByClienteIdClienteAndEstado(clienteId, EstadoCarrito.ACTIVO)
                .orElseGet(() -> {
                    Carrito nuevoCarrito = new Carrito();
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
            BigDecimal precioUnitario,
            Authentication authentication
    ) {
        Carrito carrito = obtenerCarritoVerificado(carritoId, authentication);

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
            int nuevaCantidad,
            Authentication authentication
    ) {
        obtenerCarritoVerificado(carritoId, authentication);

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
    public void eliminarItem(Long carritoId, Long detalleId, Authentication authentication) {
        obtenerCarritoVerificado(carritoId, authentication);

        CarritoDetalle detalle = carritoDetalleRepository.findById(detalleId)
                .orElseThrow(() -> new RuntimeException(
                        "Detalle no encontrado con id: " + detalleId
                ));

        carritoDetalleRepository.delete(detalle);
    }

    // 5. Vaciar carrito
    public void vaciarCarrito(Long carritoId, Authentication authentication) {
        obtenerCarritoVerificado(carritoId, authentication);

        List<CarritoDetalle> detalles = carritoDetalleRepository
                .findByCarritoIdCarrito(carritoId);

        carritoDetalleRepository.deleteAll(detalles);
    }

    // 6. Calcular total del carrito
    public BigDecimal calcularTotal(Long carritoId, Authentication authentication) {
        obtenerCarritoVerificado(carritoId, authentication);

        List<CarritoDetalle> detalles = carritoDetalleRepository
                .findByCarritoIdCarrito(carritoId);

        return detalles.stream()
                .map(d -> d.getPrecioUnitario()
                        .multiply(BigDecimal.valueOf(d.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // 7. Checkout
    public Carrito checkout(Long carritoId, Authentication authentication) {
        Carrito carrito = obtenerCarritoVerificado(carritoId, authentication);

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
