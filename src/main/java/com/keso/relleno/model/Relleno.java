package com.keso.relleno.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Rellenos")
public class Relleno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_relleno")
    private Long idRelleno;

    @Column(name = "sabor_relleno", nullable = false, length = 255)
    private String saborRelleno;

    public Relleno() {}

    public Relleno(Long idRelleno, String saborRelleno) {
        this.idRelleno = idRelleno;
        this.saborRelleno = saborRelleno;
    }

    public Long getIdRelleno() {
        return idRelleno;
    }

    public void setIdRelleno(Long idRelleno) {
        this.idRelleno = idRelleno;
    }

    public String getSaborRelleno() {
        return saborRelleno;
    }

    public void setSaborRelleno(String saborRelleno) {
        this.saborRelleno = saborRelleno;
    }

    @Override
    public String toString() {
        return "Rellenos{" +
                "idRelleno=" + idRelleno +
                ", saborRelleno='" + saborRelleno + '\'' +
                '}';
    }

}
