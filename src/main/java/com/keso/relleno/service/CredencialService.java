package com.keso.relleno.service;

import com.keso.relleno.model.Credencial;
import com.keso.relleno.repository.CredencialRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CredencialService {

    private final CredencialRepository repository;

    public CredencialService(
            CredencialRepository repository
    ) {
        this.repository = repository;
    }

    public List<Credencial> obtenerTodos() {
        return repository.findAll();
    }

    public Optional<Credencial> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public Credencial guardar(Credencial credencial) {
        return repository.save(credencial);
    }

    public Credencial actualizar(
            Long id,
            Credencial actualizada
    ) {

        Credencial credencial = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Credencial no encontrada con id: " + id
                        )
                );

        credencial.setCliente(actualizada.getCliente());
        credencial.setPasswordHash(actualizada.getPasswordHash());
        credencial.setUltimoLogin(actualizada.getUltimoLogin());
        credencial.setIntentosFallidos(actualizada.getIntentosFallidos());
        credencial.setBloqueado(actualizada.getBloqueado());

        return repository.save(credencial);
    }

    public void eliminar(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Credencial no encontrada con id: " + id
            );
        }

        repository.deleteById(id);
    }
}