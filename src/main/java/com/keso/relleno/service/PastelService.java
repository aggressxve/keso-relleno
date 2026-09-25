package com.keso.relleno.service;

import com.keso.relleno.model.Pastel;
import com.keso.relleno.repository.PastelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PastelService {

    @Autowired
    private PastelRepository pastelRepository;
    public List<Pastel> obtenerTodos() {
        return pastelRepository.findAll();
    }

    public Pastel guardar(Pastel pastel) {
        return pastelRepository.save(pastel);
    }

    public void eliminar(Long id) {
        pastelRepository.deleteById(id);
    }
}
