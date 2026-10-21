package com.keso.relleno.service;

import com.keso.relleno.dto.PedidoPersonalizadoRequest;
import com.keso.relleno.model.Cliente;
import com.keso.relleno.model.Direccion;
import com.keso.relleno.model.PedidoPersonalizado;
import com.keso.relleno.repository.ClienteRepository;
import com.keso.relleno.repository.PedidoPersonalizadoRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoPersonalizadoService {

    private final PedidoPersonalizadoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final DireccionService direccionService;

    public PedidoPersonalizadoService(PedidoPersonalizadoRepository pedidoRepository,
                                      ClienteRepository clienteRepository,
                                      DireccionService direccionService) {
        this.pedidoRepository = pedidoRepository;
        this.clienteRepository = clienteRepository;
        this.direccionService = direccionService;
    }

    // @Transactional: si algo falla, no se guarda ni la dirección ni el pedido
    @Transactional
    public PedidoPersonalizado createPedido(PedidoPersonalizadoRequest req, Authentication authentication) {

        // 1. Cliente dueño de la sesión (sale del token, no de lo que mande el formulario)
        Cliente cliente = clienteRepository.findByCorreo(authentication.getName());
        if (cliente == null) {
            throw new RuntimeException("Cliente autenticado no encontrado");
        }

        // 2. Validar el tipo de entrega y, si es a domicilio, los datos de la dirección
        boolean domicilio = "domicilio".equals(req.entrega());
        if (!domicilio && !"tienda".equals(req.entrega())) {
            throw new IllegalArgumentException("Tipo de entrega no válido");
        }
        if (domicilio) {
            if (req.direccion() == null || req.direccion().isBlank()) {
                throw new IllegalArgumentException("Ingresa la dirección de entrega");
            }
            if (req.ciudad() == null || req.ciudad().isBlank()) {
                throw new IllegalArgumentException("Ingresa la ciudad de entrega");
            }
            if (req.codigoPostal() == null || !req.codigoPostal().trim().matches("\\d{5}")) {
                throw new IllegalArgumentException("El código postal debe tener 5 dígitos");
            }
        }

        // 3. Dirección: la del cliente (domicilio) o la de la tienda; se reutiliza si ya existía
        Direccion direccion = domicilio
                ? direccionService.obtenerOCrear(cliente, req.direccion(), req.ciudad(), req.codigoPostal())
                : direccionService.obtenerOCrearTienda(cliente);

        // 4. Armar y guardar el pedido
        PedidoPersonalizado pedido = new PedidoPersonalizado();
        pedido.setNombre(req.nombre());
        pedido.setCorreo(req.correo());
        pedido.setTelefono(req.telefono());
        pedido.setBizcocho(req.bizcocho());
        pedido.setRelleno(req.relleno());
        pedido.setCobertura(req.cobertura());
        pedido.setPersonas(req.personas());
        pedido.setFecha(req.fecha());
        pedido.setEntrega(req.entrega());
        pedido.setDescripcion(req.descripcion());
        pedido.setCliente(cliente);
        pedido.setDireccion(direccion);
        return pedidoRepository.save(pedido);
    }
}