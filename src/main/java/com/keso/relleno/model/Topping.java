package com.keso.relleno.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Toppings")
public class Topping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_topping")
    private Long idTopping;

    @Column(name = "sabor_topping", nullable = false, length = 255)
    private String saborTopping;

    public Topping() {}

    public Topping(Long idTopping, String saborTopping) {
        this.idTopping = idTopping;
        this.saborTopping = saborTopping;
    }

    public Long getIdTopping() {
        return idTopping;
    }

    public void setIdTopping(Long idTopping) {
        this.idTopping = idTopping;
    }

    public String getSaborTopping() {
        return saborTopping;
    }

    public void setSaborTopping(String saborTopping) {
        this.saborTopping = saborTopping;
    }

    @Override
    public String toString() {
        return "Topping{" +
                "idTopping=" + idTopping +
                ", saborTopping='" + saborTopping + '\'' +
                '}';
    }
}
