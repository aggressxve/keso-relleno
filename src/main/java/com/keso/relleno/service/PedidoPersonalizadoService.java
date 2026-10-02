package com.keso.relleno.service;

import com.keso.relleno.model.PedidoPersonalizado;
import com.keso.relleno.repository.PedidoPersonalizadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service

public class PedidoPersonalizadoService {
    private final PedidoPersonalizadoRepository pedidoRepository;

    @Autowired
    public PedidoPersonalizadoService(PedidoPersonalizadoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    public PedidoPersonalizado createPedido(PedidoPersonalizado pedido) {
        return pedidoRepository.save(pedido);
    }
}
