package com.keso.relleno.service;

import com.keso.relleno.dto.CheckoutRequest;
import com.keso.relleno.model.*;
import com.keso.relleno.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class CheckoutService {

    // Dirección de la tienda: se guarda en Direcciones cuando la compra es "recoger en tienda"
    private static final String DIRECCION_TIENDA =
            "Hacienda Purísima, Haciendas de Tizayuca";

    private final ClienteRepository clienteRepository;
    private final PastelRepository pastelRepository;
    private final CarritoRepository carritoRepository;
    //private final DireccionRepository direccionRepository;
    private final DireccionService direccionService;
    private final VentaRepository ventaRepository;
    private static final String CIUDAD_TIENDA = "Haciendas de Tizayuca, Hgo.";
    private static final String CP_TIENDA = "43815";

    public CheckoutService(ClienteRepository clienteRepository,
                           PastelRepository pastelRepository,
                           CarritoRepository carritoRepository,
                           //DireccionRepository direccionRepository,
                           DireccionService direccionService,
                           VentaRepository ventaRepository) {
        this.clienteRepository = clienteRepository;
        this.pastelRepository = pastelRepository;
        this.carritoRepository = carritoRepository;
        //this.direccionRepository = direccionRepository;
        this.direccionService = direccionService;
        this.ventaRepository = ventaRepository;
    }

    // @Transactional: si algo falla, no se guarda nada (ni carrito, ni dirección, ni ventas)
    @Transactional
    public List<Venta> procesar(CheckoutRequest request, Authentication authentication) {

        // 1. Cliente dueño de la sesión (se identifica por el token, no por lo que mande el front)
        Cliente cliente = clienteRepository.findByCorreo(authentication.getName());
        if (cliente == null) {
            throw new RuntimeException("Cliente autenticado no encontrado");
        }

        // 2. Validaciones de los datos de entrega
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("El carrito está vacío");
        }
        boolean domicilio = "domicilio".equals(request.tipoEntrega());
        if (!domicilio && !"tienda".equals(request.tipoEntrega())) {
            throw new IllegalArgumentException("Tipo de entrega no válido");
        }
        if (domicilio) {

            if (request.direccion() == null || request.direccion().isBlank()) {
                throw new IllegalArgumentException("Ingresa la dirección de entrega");
            }

            if (request.ciudad() == null || request.ciudad().isBlank()) {
                throw new IllegalArgumentException("Ingresa la ciudad de entrega");
            }
            if (request.codigoPostal() == null || !request.codigoPostal().trim().matches("\\d{5}")) {
                throw new IllegalArgumentException("El código postal debe tener 5 dígitos");
            }
        }
        if (request.fechaEntrega() == null || request.horaEntrega() == null
                || request.fechaEntrega().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La fecha y hora de entrega no son válidas");
        }

        // 3. Junta cantidades por pastel (si un pastel viene repetido, se suman) y valida cada una
        Map<Long, Integer> cantidades = new LinkedHashMap<>();
        for (CheckoutRequest.Item item : request.items()) {
            if (item.pastelId() == null || item.cantidad() == null || item.cantidad() <= 0) {
                throw new IllegalArgumentException("Hay un producto con datos inválidos");
            }
            cantidades.merge(item.pastelId(), item.cantidad(), Integer::sum);
        }

        // 4. Dirección: a domicilio, la que escribió el cliente; en tienda, la de la tienda.
        // El servicio reutiliza la dirección si el cliente ya la tenía guardada.
        Direccion direccion = domicilio
                ? direccionService.obtenerOCrear(cliente, request.direccion(), request.ciudad(), request.codigoPostal())
                : direccionService.obtenerOCrearTienda(cliente);

        // 5. Carrito ACTIVO del cliente (o uno nuevo); su contenido se reemplaza por el del front
        Carrito carrito = carritoRepository
                .findByClienteIdClienteAndEstado(cliente.getIdCliente(), EstadoCarrito.ACTIVO)
                .orElseGet(() -> {
                    Carrito nuevo = new Carrito();
                    nuevo.setCliente(cliente);
                    nuevo.setEstado(EstadoCarrito.ACTIVO);
                    return carritoRepository.save(nuevo);
                });
        carrito.getDetalles().clear();
        carritoRepository.flush(); // borra los detalles viejos antes de insertar los nuevos

        // 6. Por cada pastel: un detalle del carrito y una venta
        List<Venta> ventas = new ArrayList<>();
        for (Map.Entry<Long, Integer> entrada : cantidades.entrySet()) {
            // Solo pasteles que existan y estén activos; el precio sale de la BD
            Pastel pastel = pastelRepository.findById(entrada.getKey())
                    .filter(Pastel::getActivo)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Un producto del carrito ya no está disponible"));
            int cantidad = entrada.getValue();
            BigDecimal precio = BigDecimal.valueOf(pastel.getPrecio());

            CarritoDetalle detalle = new CarritoDetalle();
            detalle.setCarrito(carrito);
            detalle.setPastel(pastel);
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(precio);
            carrito.getDetalles().add(detalle);

            Venta venta = new Venta();
            venta.setCliente(cliente);
            venta.setPastel(pastel);
            venta.setCantidad(cantidad);
            venta.setSubtotal(precio.multiply(BigDecimal.valueOf(cantidad)).doubleValue());
            venta.setTipoEntrega(request.tipoEntrega());
            venta.setFechaEntrega(request.fechaEntrega());
            venta.setHoraEntrega(request.horaEntrega());
            venta.setDireccion(direccion);
            venta.setEstado("Pendiente");
            ventas.add(venta);
        }

        // 7. Carrito completado y ventas guardadas
        carrito.setEstado(EstadoCarrito.COMPLETADO);
        carritoRepository.save(carrito);
        return ventaRepository.saveAll(ventas);
    }
}