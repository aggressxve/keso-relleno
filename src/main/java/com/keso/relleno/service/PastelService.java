package com.keso.relleno.service;

import com.keso.relleno.model.Pastel;
import com.keso.relleno.repository.PastelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public boolean eliminar(Long id) {
        return pastelRepository.findById(id)
                .map(pastel -> {
                    pastelRepository.delete(pastel);
                    return true;
                })
                .orElse(false);
    }

    public Optional<Pastel> obtenerPorId(Long id) {
        return pastelRepository.findById(id);
    }

    public Optional<Pastel> actualizar(Long id, Pastel pastelActualizado) {
        return pastelRepository.findById(id).map(pastel -> {
            pastel.setNombre(pastelActualizado.getNombre());
            pastel.setPan(pastelActualizado.getPan());
            pastel.setRelleno(pastelActualizado.getRelleno());
            pastel.setTopping(pastelActualizado.getTopping());
            pastel.setCubierta(pastelActualizado.getCubierta());

            return pastelRepository.save(pastel);
        });
    }
}
