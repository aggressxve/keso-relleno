package com.keso.relleno.service;

import com.keso.relleno.dto.CheckoutRequest;
import com.keso.relleno.model.*;
import com.keso.relleno.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

/**
 * Pruebas del flujo de compra (CheckoutService) con repositorios simulados.
 * Verifican las reglas de negocio sin tocar MySQL.
 */
@ExtendWith(MockitoExtension.class)
class CheckoutServiceTest {

    @Mock private ClienteRepository clienteRepository;
    @Mock private PastelRepository pastelRepository;
    @Mock private CarritoRepository carritoRepository;
    @Mock private DireccionRepository direccionRepository;
    @Mock private VentaRepository ventaRepository;

    @InjectMocks private CheckoutService checkoutService;

    private Authentication auth;
    private Cliente cliente;

    @BeforeEach
    void setUp() {
        auth = mock(Authentication.class);
        lenient().when(auth.getName()).thenReturn("luis@keso.com");

        cliente = new Cliente(1L, "Luis", "luis@keso.com", "5512345678");
    }

    private CheckoutRequest request(String tipo, String direccion, String ciudad,
                                    String cp, List<CheckoutRequest.Item> items) {
        return new CheckoutRequest(
                tipo, direccion, ciudad, cp,
                LocalDate.now().plusDays(1),
                LocalTime.of(14, 0),
                items);
    }

    @Test
    @DisplayName("Rechaza el checkout si el carrito viene vacío")
    void rechaza_carrito_vacio() {
        when(clienteRepository.findByCorreo("luis@keso.com")).thenReturn(cliente);

        CheckoutRequest req = request("tienda", null, null, null, List.of());

        assertThatThrownBy(() -> checkoutService.procesar(req, auth))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("vacío");

        verify(ventaRepository, never()).saveAll(anyList());
    }

    @Test
    @DisplayName("Rechaza un tipo de entrega distinto de domicilio/tienda")
    void rechaza_tipo_de_entrega_invalido() {
        when(clienteRepository.findByCorreo("luis@keso.com")).thenReturn(cliente);

        CheckoutRequest req = request("avion", null, null, null,
                List.of(new CheckoutRequest.Item(10L, 1)));

        assertThatThrownBy(() -> checkoutService.procesar(req, auth))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tipo de entrega");
    }

    @Test
    @DisplayName("A domicilio exige dirección y código postal válidos")
    void rechaza_domicilio_sin_direccion() {
        when(clienteRepository.findByCorreo("luis@keso.com")).thenReturn(cliente);

        CheckoutRequest req = request("domicilio", "   ", "Tizayuca", "43815",
                List.of(new CheckoutRequest.Item(10L, 1)));

        assertThatThrownBy(() -> checkoutService.procesar(req, auth))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("dirección");
    }

    @Test
    @DisplayName("Compra a tienda: crea la venta con el precio de la BD y completa el carrito")
    void checkout_a_tienda_crea_la_venta() {
        when(clienteRepository.findByCorreo("luis@keso.com")).thenReturn(cliente);

        // No hay carrito activo todavía -> se crea uno
        when(carritoRepository.findByClienteIdClienteAndEstado(1L, EstadoCarrito.ACTIVO))
                .thenReturn(Optional.empty());
        when(carritoRepository.save(any(Carrito.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        // No hay direcciones guardadas -> se crea la de la tienda
        when(direccionRepository.findByClienteIdCliente(1L)).thenReturn(new ArrayList<>());
        when(direccionRepository.save(any(Direccion.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        // El pastel existe, está activo y cuesta 100.00
        Pastel pastel = new Pastel(10L, "Tres leches", "desc", 10, 100.0, "img.jpg");
        when(pastelRepository.findById(10L)).thenReturn(Optional.of(pastel));

        when(ventaRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        CheckoutRequest req = request("tienda", null, null, null,
                List.of(new CheckoutRequest.Item(10L, 2)));

        List<Venta> ventas = checkoutService.procesar(req, auth);

        assertThat(ventas).hasSize(1);
        Venta venta = ventas.get(0);
        assertThat(venta.getSubtotal()).isEqualTo(200.0); // 100 * 2
        assertThat(venta.getEstado()).isEqualTo("PENDIENTE");
        assertThat(venta.getTipoEntrega()).isEqualTo("tienda");

        // El carrito debe quedar COMPLETADO
        // (usamos atLeastOnce porque es el MISMO objeto carrito el que se guarda
        //  dos veces y, al mutarse, la referencia guardada también cambia a COMPLETADO)
        verify(carritoRepository, atLeastOnce())
                .save(argThat(c -> c.getEstado() == EstadoCarrito.COMPLETADO));
        verify(ventaRepository).saveAll(anyList());
    }
}
