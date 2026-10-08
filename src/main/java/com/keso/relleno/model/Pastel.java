package com.keso.relleno.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "Pasteles")
public class Pastel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pastel")
    private Long idPastel;

    @Column(name = "nombre", nullable = false, length = 255)
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "numero_de_personas")
    private int numeroDePersonas;

    @Column(name = "precio", nullable = false, columnDefinition = "DECIMAL(10, 2)")
    private Double precio;

    @Column(name = "img", nullable = false)
    private String urlFoto;

    // Borrado lógico: false = "eliminado" (no se muestra, pero conserva sus ventas)
    // El DEFAULT 1 evita que los pasteles que ya existen queden inactivos al crearse la columna
    @Column(name = "activo", nullable = false, columnDefinition = "TINYINT(1) NOT NULL DEFAULT 1")
    private Boolean activo = true;

    // Pan, relleno y cubierta pueden ser null cuando se elige "No aplica"
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_pan")
    @JsonIgnoreProperties({"pasteles"})
    private Pan pan;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_relleno")
    @JsonIgnoreProperties({"pasteles"})
    private Relleno relleno;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_topping")
    @JsonIgnoreProperties({"pasteles"})
    private Topping topping;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cubierta", nullable = false)
    @JsonIgnoreProperties({"pasteles"})
    private Cubierta cubierta;

    @OneToMany(mappedBy = "pastel", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Venta> ventas;

    @OneToMany(mappedBy = "pastel")
    @JsonIgnore
    private List<CarritoDetalle> carritoDetalles;

    public Pastel() {

    }

    public Pastel(Long idPastel, String nombre, String descripcion, int numeroDePersonas, Double precio, String urlFoto) {
        this.idPastel = idPastel;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.numeroDePersonas = numeroDePersonas;
        this.precio = precio;
        this.urlFoto = urlFoto;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public int getNumeroDePersonas() {
        return numeroDePersonas;
    }

    public void setNumeroDePersonas(int numeroDePersonas) {
        this.numeroDePersonas = numeroDePersonas;
    }

    public Double getPrecio() {
        return precio;
    }

    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    public String getUrlFoto() {
        return urlFoto;
    }

    public void setUrlFoto(String urlFoto) {
        this.urlFoto = urlFoto;
    }

    public Long getIdPastel() {
        return idPastel;
    }

    public void setIdPastel(Long idPastel) {
        this.idPastel = idPastel;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Pan getPan() {
        return pan;
    }

    public void setPan(Pan pan) {
        this.pan = pan;
    }

    public Relleno getRelleno() {
        return relleno;
    }

    public void setRelleno(Relleno relleno) {
        this.relleno = relleno;
    }

    public Topping getTopping() {
        return topping;
    }

    public void setTopping(Topping topping) {
        this.topping = topping;
    }

    public Cubierta getCubierta() {
        return cubierta;
    }

    public void setCubierta(Cubierta cubierta) {
        this.cubierta = cubierta;
    }

    public List<Venta> getVentas() {
        return ventas;
    }

    public void setVentas(List<Venta> ventas) {
        this.ventas = ventas;
    }

    public List<CarritoDetalle> getCarritoDetalles() {
        return carritoDetalles;
    }

    public void setCarritoDetalles(List<CarritoDetalle> carritoDetalles) {
        this.carritoDetalles = carritoDetalles;
    }

    @Override
    public String toString() {
        return "Pastel{" +
                "nombre='" + nombre + '\'' +
                ", idPastel=" + idPastel +
                '}';
    }
}
