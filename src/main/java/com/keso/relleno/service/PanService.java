package com.keso.relleno.service;

import com.keso.relleno.model.Pan;
import com.keso.relleno.repository.PanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PanService {

    @Autowired
    private PanRepository panRepository;

    public List<Pan> obtenerTodos() {
        return panRepository.findAll();
    }

    public Optional<Pan> obtenerPorId(Long id) {
        return panRepository.findById(id);
    }

    public Pan guardar(Pan pan) {
        return panRepository.save(pan);
    }

    public Pan actualizar(Long id, Pan panActualizado) {
        return panRepository.findById(id)
                .map(pan -> {
                    pan.setNombre(panActualizado.getNombre());
                    return panRepository.save(pan);
                })
                .orElseThrow(() -> new RuntimeException("Pan no encontrado con id: " + id));
    }

    public void eliminar(Long id) {
        panRepository.deleteById(id);
    }
}