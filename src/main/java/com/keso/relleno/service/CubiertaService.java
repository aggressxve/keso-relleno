package com.keso.relleno.service;

import com.keso.relleno.model.Cubierta;
import com.keso.relleno.repository.CubiertaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CubiertaService {

    private final CubiertaRepository cubiertaRepository;

    @Autowired
    public CubiertaService(CubiertaRepository cubiertaRepository) {
        this.cubiertaRepository = cubiertaRepository;
    }

    public List<Cubierta> getCubiertas() {
        return cubiertaRepository.findAll();
    }

    public Cubierta createCubierta(Cubierta cubierta) {
        return cubiertaRepository.save(cubierta);
    }
}