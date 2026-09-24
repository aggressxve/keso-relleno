package com.keso.relleno.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "Direcciones")
public class Direccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_direccion")
    private Long idDireccion;

    @Column(name = "lugar_entrega", nullable = false)
    private String lugarEntrega;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    @JsonIgnoreProperties({"direcciones", "ventas"}) // Evita loop Cliente <-> Direccion
    private Cliente cliente;

    @OneToMany(mappedBy = "direccion", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("direccion") // Evita loop Venta <-> Direccion
    private List<Venta> ventas;

    public Direccion() {}

    public Direccion(Long idDireccion, String lugarEntrega) {
        this.idDireccion = idDireccion;
        this.lugarEntrega = lugarEntrega;
    }

    public Long getIdDireccion() {
        return idDireccion;
    }

    public void setIdDireccion(Long idDireccion) {
        this.idDireccion = idDireccion;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public String getLugarEntrega() {
        return lugarEntrega;
    }

    public void setLugarEntrega(String lugarEntrega) {
        this.lugarEntrega = lugarEntrega;
    }

    public List<Venta> getVentas() {
        return ventas;
    }

    public void setVentas(List<Venta> ventas) {
        this.ventas = ventas;
    }

}
