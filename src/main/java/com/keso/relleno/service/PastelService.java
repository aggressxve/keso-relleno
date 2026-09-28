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

    public void eliminar(Long id) {
        pastelRepository.deleteById(id);
    }

    public Optional<Pastel> obtenerPorId(Long id) {
        return pastelRepository.findById(id);
    }

    public Pastel actualizar(
            Long id,
            Pastel pastelActualizado
    ) {

        Pastel pastel = pastelRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Pastel no encontrado con id: " + id
                        )
                );

        pastel.setNombre(pastelActualizado.getNombre());
        pastel.setPan(pastelActualizado.getPan());
        pastel.setRelleno(pastelActualizado.getRelleno());
        pastel.setTopping(pastelActualizado.getTopping());
        pastel.setCubierta(pastelActualizado.getCubierta());

        return pastelRepository.save(pastel);
    }
}
