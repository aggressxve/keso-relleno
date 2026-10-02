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
    public Optional<Topping> actualizar(Long id, Topping toppingActualizado) {
        return toppingRepository.findById(id).map(topping -> {
            topping.setSaborTopping(toppingActualizado.getSaborTopping());
            return toppingRepository.save(topping);
        });
    }
    public boolean eliminar(Long id) {
        return toppingRepository.findById(id)
                .map(topping -> {
                    toppingRepository.delete(topping);
                    return true;
                })
                .orElse(false);
    }

}
