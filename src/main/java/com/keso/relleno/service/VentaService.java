package com.keso.relleno.service;

import com.keso.relleno.model.Direccion;
import com.keso.relleno.model.Venta;
import com.keso.relleno.repository.ClienteRepository;
import com.keso.relleno.repository.DireccionRepository;
import com.keso.relleno.repository.PastelRepository;
import com.keso.relleno.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private DireccionRepository direccionRepository;

    @Autowired
    private PastelRepository pastelRepository;

    public List<Venta> obtenerTodos() {
        return ventaRepository.findAll();
    }

    public Optional<Venta> obtenerPorId(Long id) {
        return ventaRepository.findById(id);
    }

    public Venta guardar(Venta venta){
        return ventaRepository.save(venta);
    }

    @Transactional
    public Optional<Venta> cambiarPastel(Long idVenta, Long idPastel) {

        return ventaRepository.findById(idVenta).map(venta -> {

            var pastel = pastelRepository.findById(idPastel)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "El pastel indicado no existe"
                            ));

            venta.setPastel(pastel);

            return ventaRepository.save(venta);
        });
    }

    @Transactional
    public Optional<Venta> actualizar(Long id, Venta datos){
        return ventaRepository.findById(id).map(venta -> {

            if (datos.getSubtotal() != null){
                venta.setSubtotal(datos.getSubtotal());
            }
            if (datos.getFechaEntrega() != null){
                venta.setFechaEntrega(datos.getFechaEntrega());
            }
            if (datos.getHoraEntrega() != null){
                venta.setHoraEntrega(datos.getHoraEntrega());
            }
            if (datos.getTipoEntrega() != null){
                venta.setTipoEntrega(datos.getTipoEntrega());
            }
            if (datos.getEstado() != null){
                venta.setEstado(datos.getEstado());
            }

            if (datos.getDireccion() != null
                    && datos.getDireccion().getIdDireccion() != null){
                Direccion direccion = direccionRepository
                        .findById(datos.getDireccion().getIdDireccion())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "La direccion indicada no existe"
                                ));
                venta.setDireccion(direccion);
            }

            if (datos.getCliente() != null
                    && datos.getCliente().getIdCliente() != null){
                venta.setCliente(clienteRepository.findById(
                        datos.getCliente().getIdCliente()
                        ).orElseThrow(()->
                        new IllegalArgumentException(
                                "El cliente indicado no existe"
                        ))
                );
            }

            if (datos.getPastel() != null
                    && datos.getPastel().getIdPastel() != null){
                venta.setPastel(
                        pastelRepository.findById(datos.getPastel()
                                .getIdPastel()
                        ).orElseThrow(() -> new IllegalArgumentException(
                                "El pastel indicado no existe"
                        ))
                );
            }
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
