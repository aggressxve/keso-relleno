package com.keso.relleno.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Cubiertas")
public class Cubierta {
    @Id // Define la primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cubierta")
    private Long idCubierta;

    @Column(name="sabor_cubierta", nullable = false, length = 255)
    private String saborCubierta;

    public Cubierta() {}

    public Cubierta(Long idCubierta, String saborCubierta) {
        this.idCubierta = idCubierta;
        this.saborCubierta = saborCubierta;
    }

    public Long getIdCubierta() {
        return idCubierta;
    }

    public void setIdCubierta(Long idCubierta) {
        this.idCubierta = idCubierta;
    }

    public String getsaborCubierta() {
        return saborCubierta;
    }

    public void setsaborCubierta(String saborCubierta) {
        this.saborCubierta = saborCubierta;
    }

    @Override
    public String toString() {
        return "Cubiertas{" +
                "idCubierta=" + idCubierta +
                ", sabor_relleno='" + saborCubierta + '\'' +
                '}';
    }
}
