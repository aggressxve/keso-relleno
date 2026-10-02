package com.keso.relleno.controller;

import com.keso.relleno.model.Carrito;
import com.keso.relleno.model.CarritoDetalle;
import com.keso.relleno.service.CarritoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/carritos")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    @GetMapping
    public List<Carrito> obtenerTodos() {
        return carritoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Carrito> obtenerPorId(
            @PathVariable Long id
    ) {

        return carritoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Carrito crear(
            @RequestBody Carrito carrito
    ) {
        return carritoService.guardar(carrito);
    }

    @PutMapping("/{id}")
    public Carrito actualizar(
            @PathVariable Long id,
            @RequestBody Carrito carrito
    ) {
        return carritoService.actualizar(id, carrito);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id
    ) {

        carritoService.eliminar(id);

        return ResponseEntity.noContent().build();
    }

    // obtener carrito activo del cliente autenticado
    @GetMapping("/activo")
    public Carrito obtenerCarritoActivo(Authentication authentication) {
        return carritoService.obtenerCarritoActivo(authentication);
    }

    // agregar item al carrito
    @PostMapping("/{carritoId}/items")
    public CarritoDetalle agregarItem(
            @PathVariable Long carritoId,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        Long pastelId = Long.valueOf(body.get("pastelId").toString());
        int cantidad = Integer.parseInt(body.get("cantidad").toString());
        BigDecimal precioUnitario = new BigDecimal(body.get("precioUnitario").toString());

        return carritoService.agregarItem(carritoId, pastelId, cantidad, precioUnitario, authentication);
    }

    // actualizar cantidad de un item
    @PutMapping("/{carritoId}/items/{detalleId}")
    public ResponseEntity<CarritoDetalle> actualizarCantidad(
            @PathVariable Long carritoId,
            @PathVariable Long detalleId,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        int cantidad = Integer.parseInt(body.get("cantidad").toString());
        CarritoDetalle detalle = carritoService.actualizarCantidad(carritoId, detalleId, cantidad, authentication);

        if (detalle == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(detalle);
    }

    // eliminar un item del carrito
    @DeleteMapping("/{carritoId}/items/{detalleId}")
    public ResponseEntity<Void> eliminarItem(
            @PathVariable Long carritoId,
            @PathVariable Long detalleId,
            Authentication authentication
    ) {
        carritoService.eliminarItem(carritoId, detalleId, authentication);
        return ResponseEntity.noContent().build();
    }

    // vaciar carrito
    @DeleteMapping("/{carritoId}/items")
    public ResponseEntity<Void> vaciarCarrito(
            @PathVariable Long carritoId,
            Authentication authentication
    ) {
        carritoService.vaciarCarrito(carritoId, authentication);
        return ResponseEntity.noContent().build();
    }

    // total del carrito
    @GetMapping("/{carritoId}/total")
    public Map<String, BigDecimal> calcularTotal(
            @PathVariable Long carritoId,
            Authentication authentication
    ) {
        BigDecimal total = carritoService.calcularTotal(carritoId, authentication);
        return Map.of("total", total);
    }

    // checkout
    @PostMapping("/{carritoId}/checkout")
    public Carrito checkout(
            @PathVariable Long carritoId,
            Authentication authentication
    ) {
        return carritoService.checkout(carritoId, authentication);
    }
}