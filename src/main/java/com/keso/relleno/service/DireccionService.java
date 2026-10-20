package com.keso.relleno.service;

import com.keso.relleno.exception.DireccionNotFoundException;
import com.keso.relleno.model.Cliente;
import com.keso.relleno.model.Direccion;
import com.keso.relleno.repository.ClienteRepository;
import com.keso.relleno.repository.DireccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DireccionService {

    private final DireccionRepository direccionRepository;
    private final ClienteRepository clienteRepository;

    // Datos de la tienda: única fuente para el carrito y los pedidos personalizados
    public static final String LUGAR_TIENDA =
            "Hacienda Purísima, Haciendas de Tizayuca, 43815 Haciendas de Tizayuca, Hgo.";
    public static final String CIUDAD_TIENDA = "Tizayuca";
    public static final String CP_TIENDA = "43815";

    @Autowired
    public DireccionService(
            DireccionRepository direccionRepository,
            ClienteRepository clienteRepository
    ) {
        this.direccionRepository = direccionRepository;
        this.clienteRepository = clienteRepository;
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

    // Busca una dirección igual del cliente; si no la tiene, la crea (así no se duplican)
    public Direccion obtenerOCrear(Cliente cliente, String lugar, String ciudad, String codigoPostal) {
        String l = lugar.trim();
        String c = ciudad.trim();
        String cp = codigoPostal.trim();

        return direccionRepository.findByClienteIdCliente(cliente.getIdCliente()).stream()
                .filter(d -> l.equalsIgnoreCase(d.getLugarEntrega())
                        && c.equalsIgnoreCase(d.getCiudad())
                        && cp.equals(d.getCodigoPostal()))
                .findFirst()
                .orElseGet(() -> {
                    Direccion nueva = new Direccion();
                    nueva.setCliente(cliente);
                    nueva.setLugarEntrega(l);
                    nueva.setCiudad(c);
                    nueva.setCodigoPostal(cp);
                    return direccionRepository.save(nueva);
                });
    }

    // Dirección de la tienda a nombre del cliente (para "recoger en tienda")
    public Direccion obtenerOCrearTienda(Cliente cliente) {
        return obtenerOCrear(cliente, LUGAR_TIENDA, CIUDAD_TIENDA, CP_TIENDA);
    }

    private Direccion obtenerDireccionVerificada(Long id, Authentication authentication) {
        Cliente cliente = obtenerClienteAutenticado(authentication);
        Direccion direccion = direccionRepository.findById(id)
                .orElseThrow(() ->
                        new DireccionNotFoundException("No se encontró la dirección con el id: " + id));
        if (!direccion.getCliente().getIdCliente().equals(cliente.getIdCliente())) {
            throw new AccessDeniedException("No tienes acceso a esta dirección");
        }
        return direccion;
    }

    // Metodo para traer direcciones del cliente autenticado
    public List<Direccion> mostrarDirecciones(Authentication authentication) {
        Cliente cliente = obtenerClienteAutenticado(authentication);
        return direccionRepository.findByClienteIdCliente(cliente.getIdCliente());
    }

    // Metodo para traer una dirección por Id
    public Direccion mostrarDireccionPorId(Long id, Authentication authentication) {
        return obtenerDireccionVerificada(id, authentication);
    }

    // Metodo para crear una dirección
    public Direccion crearDireccion(Direccion direccion, Authentication authentication) {
        Cliente cliente = obtenerClienteAutenticado(authentication);
        direccion.setCliente(cliente);
        return direccionRepository.save(direccion);
    }

    // Metodo para actualizar una dirección
    public Direccion actualizarDireccion(Direccion direccion, Long id, Authentication authentication) {
        Direccion existente = obtenerDireccionVerificada(id, authentication);
        existente.setLugarEntrega(direccion.getLugarEntrega());
        return direccionRepository.save(existente);
    }

    // Metodo para eliminar una dirección
    public void eliminarDireccionId(Long id, Authentication authentication) {
        obtenerDireccionVerificada(id, authentication);
        direccionRepository.deleteById(id);
    }
}
