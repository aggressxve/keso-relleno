package com.keso.relleno.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Roles")
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Long idRol;

    @Column(name = "titulo", nullable = false, length = 255)
    private String titulo;

    public Rol() {}

    public Rol(Long idRol, String titulo) {
        this.idRol = idRol;
        this.titulo = titulo;
    }

    public Long getIdRol() {
        return idRol;
    }

    public void setIdRol(Long idRol) {
        this.idRol = idRol;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    @Override
    public String toString() {
        return "Rol{" +
                "idRol=" + idRol +
                ", titulo='" + titulo + '\'' +
                '}';
    }
}
