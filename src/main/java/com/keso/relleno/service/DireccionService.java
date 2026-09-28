package com.keso.relleno.service;

import com.keso.relleno.exception.DireccionNotFoundException;
import com.keso.relleno.model.Direccion;
import com.keso.relleno.repository.DireccionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DireccionService {

    private final DireccionRepository direccionRepository;

    @Autowired
    public DireccionService(DireccionRepository direccionRepository) {
        this.direccionRepository = direccionRepository;
    }

    // Metodo para traer todas las direcciones
    public List<Direccion> mostrarDirecciones() {
        return direccionRepository.findAll();
    }

    // Metodo para traer una dirección por Id
    public Direccion mostrarDireccionPorId(Long id) {
        return direccionRepository.findById(id)
                .orElseThrow(() ->
                        new DireccionNotFoundException("No se encontró la dirección con el id: " + id));
    }

    // Metodo para crear una dirección
    public Direccion crearDireccion(Direccion direccion) {
        return direccionRepository.save(direccion);
    }

    // Metodo para actualizar una dirección
    public Direccion actualizarDireccion(Direccion direccion, Long id) {
        return direccionRepository.findById(id)
                .map(data -> {
                    data.setLugarEntrega(direccion.getLugarEntrega());
                    data.setCliente(direccion.getCliente());
                    return direccionRepository.save(data);
                })
                .orElseThrow(() ->
                        new DireccionNotFoundException("No se encontró la dirección con el id: " + id));
    }

    // Metodo para eliminar una dirección
    public void eliminarDireccionId(Long id) {
        if (direccionRepository.existsById(id)) {
            direccionRepository.deleteById(id);
        } else {
            throw new DireccionNotFoundException(
                    "No se encontró la dirección con el id: " + id);
        }
    }
}
