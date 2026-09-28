package com.keso.relleno.service;

import com.keso.relleno.model.Topping;
import com.keso.relleno.repository.ToppingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ToppingService {

    @Autowired
    private ToppingRepository toppingRepository;
    public List<Topping> obtenerTodos() {
        return toppingRepository.findAll();
    }
    public Optional<Topping> obtenerPorId(Long id) {
        return toppingRepository.findById(id);
    }
    public Topping guardar(Topping topping) {
        return toppingRepository.save(topping);
    }
    public Topping actualizar(Long id, Topping toppingActualizado) {
        return toppingRepository.findById(id)
                .map(topping -> {
                    topping.setSaborTopping(toppingActualizado.getSaborTopping());
                    return toppingRepository.save(topping);
                })
                .orElseThrow(() -> new RuntimeException("Topping no encontrado con id: " + id));
    }
    public void eliminar(Long id) {
        toppingRepository.deleteById(id);
    }

}
