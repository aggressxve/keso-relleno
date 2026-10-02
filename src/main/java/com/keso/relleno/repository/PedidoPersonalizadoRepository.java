package com.keso.relleno.repository;

import com.keso.relleno.model.PedidoPersonalizado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface PedidoPersonalizadoRepository extends JpaRepository <PedidoPersonalizado, Long> {


}
