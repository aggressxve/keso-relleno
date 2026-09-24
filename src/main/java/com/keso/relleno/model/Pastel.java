package com.keso.relleno.model;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pan", nullable = false)
    @JsonIgnoreProperties("pasteles")
    private Pan pan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_relleno", nullable = false)
    @JsonIgnoreProperties("pasteles")
    private Relleno relleno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_topping", nullable = false)
    @JsonIgnoreProperties("pasteles")
    private Topping topping;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cubierta", nullable = false)
    @JsonIgnoreProperties("pasteles")
    private Cubierta cubierta;

    // LADO INVERSO QUE TE FALTABA
    @OneToMany(mappedBy = "pastel", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("pastel")
    private List<Venta> ventas;

    public Pastel() {

    }

    public Pastel(Long idPastel, String nombre) {
        this.idPastel = idPastel;
        this.nombre = nombre;
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

    @Override
    public String toString() {
        return "Pastel{" +
                "nombre='" + nombre + '\'' +
                ", idPastel=" + idPastel +
                '}';
    }
}
