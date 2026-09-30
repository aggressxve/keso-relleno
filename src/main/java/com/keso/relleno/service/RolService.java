package com.keso.relleno.service;

import com.keso.relleno.exceptions.RolNoEncontradoException;
import com.keso.relleno.model.Rol;
import com.keso.relleno.repository.RolRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RolService {
    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    public List<Rol> todosLosRoles() {
        return rolRepository.findAll();
    }

    public Rol encontrarRolPorId(Long id) {
        return rolRepository.findById(id)
                .orElseThrow(() -> new RolNoEncontradoException("Rol error", id));
    }

    public Rol crearRol(Rol rol) {
        return rolRepository.save(rol);
    }


}
