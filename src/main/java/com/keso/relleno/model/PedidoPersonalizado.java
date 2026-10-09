package com.keso.relleno.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "pedido_personalizado")
public class PedidoPersonalizado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long idPedido;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 150)
    private String correo;

    @Column(nullable = false, length = 20)
    private String telefono;

    // Pueden ser null cuando el cliente elige "No aplica"
    @Column(length = 50)
    private String bizcocho;

    @Column(length = 50)
    private String relleno;

    @Column(length = 50)
    private String cobertura;

    @Column(nullable = false)
    private Integer personas;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 20)
    private String entrega;

    @Column(nullable = false, length = 500)
    private String descripcion;

    // Constructor vacío
    public PedidoPersonalizado() {}

    public PedidoPersonalizado(Long idPedido, String nombre, String correo, String telefono,
                               String bizcocho, String relleno, String cobertura,
                               Integer personas, LocalDate fecha, String entrega, String descripcion) {
        this.idPedido = idPedido;
        this.nombre = nombre;
        this.correo = correo;
        this.telefono = telefono;
        this.bizcocho = bizcocho;
        this.relleno = relleno;
        this.cobertura = cobertura;
        this.personas = personas;
        this.fecha = fecha;
        this.entrega = entrega;
        this.descripcion = descripcion;
    }

    public Long getIdPedido() { return idPedido; }
    public void setIdPedido(Long idPedido) { this.idPedido = idPedido; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getBizcocho() { return bizcocho; }
    public void setBizcocho(String bizcocho) { this.bizcocho = bizcocho; }

    public String getRelleno() { return relleno; }
    public void setRelleno(String relleno) { this.relleno = relleno; }

    public String getCobertura() { return cobertura; }
    public void setCobertura(String cobertura) { this.cobertura = cobertura; }

    public Integer getPersonas() { return personas; }
    public void setPersonas(Integer personas) { this.personas = personas; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getEntrega() { return entrega; }
    public void setEntrega(String entrega) { this.entrega = entrega; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}