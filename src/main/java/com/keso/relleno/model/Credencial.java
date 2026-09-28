package com.keso.relleno.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "Credenciales")
public class Credencial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "credencial_id")
    private Long idCredencial;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"credencial", "direcciones", "ventas"})
    private Cliente cliente;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "ultimo_login")
    private LocalDateTime ultimoLogin;

    @Column(name = "intentos_fallidos", nullable = false)
    private Integer intentosFallidos = 0;

    @Column(name = "bloqueado", nullable = false)
    private Boolean bloqueado = false;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    public Credencial() {
    }

    public Long getIdCredencial() {
        return idCredencial;
    }

    public void setIdCredencial(Long idCredencial) {
        this.idCredencial = idCredencial;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public LocalDateTime getUltimoLogin() {
        return ultimoLogin;
    }

    public void setUltimoLogin(LocalDateTime ultimoLogin) {
        this.ultimoLogin = ultimoLogin;
    }

    public Integer getIntentosFallidos() {
        return intentosFallidos;
    }

    public void setIntentosFallidos(Integer intentosFallidos) {
        this.intentosFallidos = intentosFallidos;
    }

    public Boolean getBloqueado() {
        return bloqueado;
    }

    public void setBloqueado(Boolean bloqueado) {
        this.bloqueado = bloqueado;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(LocalDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }
}