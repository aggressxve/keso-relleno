package com.keso.relleno.service;

import com.keso.relleno.model.Relleno;
import com.keso.relleno.repository.RellenoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RellenoService {

    private final RellenoRepository rellenoRepository;

    public RellenoService(RellenoRepository rellenoRepository) {
        this.rellenoRepository = rellenoRepository;
    }

    public List<Relleno> obtenerTodos() {
        return rellenoRepository.findAll();
    }

    public Relleno guardar(Relleno relleno) {
        return rellenoRepository.save(relleno);
    }
}
