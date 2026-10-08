package com.keso.relleno.service;

import com.keso.relleno.model.Pastel;
import com.keso.relleno.repository.PastelRepository;
import com.keso.relleno.repository.PanRepository;
import com.keso.relleno.repository.RellenoRepository;
import com.keso.relleno.repository.ToppingRepository;
import com.keso.relleno.repository.CubiertaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PastelService {

    @Autowired
    private PastelRepository pastelRepository;

    @Autowired
    private PanRepository panRepository;

    @Autowired
    private RellenoRepository rellenoRepository;

    @Autowired
    private ToppingRepository toppingRepository;

    @Autowired
    private CubiertaRepository cubiertaRepository;

    public boolean componentesExisten(Pastel pastel) {
        return panRepository.existsById(pastel.getPan().getIdPan())
                && rellenoRepository.existsById(pastel.getRelleno().getIdRelleno())
                && (pastel.getTopping() == null
                        || (pastel.getTopping().getIdTopping() != null
                        && toppingRepository.existsById(pastel.getTopping().getIdTopping())))
                && cubiertaRepository.existsById(pastel.getCubierta().getIdCubierta());
    }
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
            // Campos que antes no se actualizaban y que el modal de editar sí permite cambiar
            pastel.setDescripcion(pastelActualizado.getDescripcion());
            pastel.setPrecio(pastelActualizado.getPrecio());
            pastel.setNumeroDePersonas(pastelActualizado.getNumeroDePersonas());
            pastel.setPan(pastelActualizado.getPan());
            pastel.setRelleno(pastelActualizado.getRelleno());
            pastel.setTopping(pastelActualizado.getTopping());
            pastel.setCubierta(pastelActualizado.getCubierta());

            return pastelRepository.save(pastel);
        });
    }
}
