package com.keso.relleno.service;

import com.keso.relleno.model.Venta;
import com.keso.relleno.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    public List<Venta> obtenerTodos() {
        return ventaRepository.findAll();
    }

    public Optional<Venta> obtenerPorId(Long id) {
        return ventaRepository.findById(id);
    }

    public Venta guardar(Venta venta){
        return ventaRepository.save(venta);
    }

    public Optional<Venta> actualizar(Long id, Venta ventaActualizado) {
        return ventaRepository.findById(id).map(venta -> {
            venta.setSubtotal(ventaActualizado.getSubtotal());
            venta.setFecha(ventaActualizado.getFecha());
            venta.setDireccion(ventaActualizado.getDireccion());
            venta.setCliente(ventaActualizado.getCliente());
            venta.setPastel(ventaActualizado.getPastel());
            venta.setEmpleado(ventaActualizado.getEmpleado());
            return ventaRepository.save(venta);
        });
    }

    public boolean eliminar(Long id) {
        return ventaRepository.findById(id)
                .map(venta -> {
                    ventaRepository.delete(venta);
                    return true;
                })
                .orElse(false);
    }
}
