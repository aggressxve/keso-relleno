package com.keso.relleno.repository;

import com.keso.relleno.model.Cubierta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CubiertaRepository extends JpaRepository<Cubierta, Long> {
}