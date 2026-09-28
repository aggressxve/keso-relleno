package com.keso.relleno.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "Carrito_Detalle")
public class CarritoDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "detalle_id")
    private Long idDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrito_id", nullable = false)
    @JsonIgnoreProperties("detalles")
    private Carrito carrito;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pastel_id", nullable = false)
    @JsonIgnoreProperties({"ventas", "carritoDetalles"})
    private Pastel pastel;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(
            name = "precio_unitario",
            nullable = false,
            precision = 10,
            scale = 2
    )
    private BigDecimal precioUnitario;

    public CarritoDetalle() {
    }

    public Long getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(Long idDetalle) {
        this.idDetalle = idDetalle;
    }

    public Carrito getCarrito() {
        return carrito;
    }

    public void setCarrito(Carrito carrito) {
        this.carrito = carrito;
    }

    public Pastel getPastel() {
        return pastel;
    }

    public void setPastel(Pastel pastel) {
        this.pastel = pastel;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
}