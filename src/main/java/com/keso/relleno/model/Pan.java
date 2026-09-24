package com.keso.relleno.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Panes")
public class Pan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pan")
    private Long idPan;

    @Column(name = "nombre", nullable = false, length = 255)
    private String nombre;

    public Pan(Long idPan, String nombre) {
        this.idPan = idPan;
        this.nombre = nombre;
    }

    public Long getIdPan() {
        return idPan;
    }

    public void setIdPan(Long idPan) {
        this.idPan = idPan;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    @Override
    public String toString() {
        return "Panes{" +
                "idPan=" + idPan +
                ", nombre='" + nombre + '\'' +
                '}';
    }
}
