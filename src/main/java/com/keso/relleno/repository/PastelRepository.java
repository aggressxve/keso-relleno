package com.keso.relleno.repository;

import com.keso.relleno.model.Pastel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PastelRepository extends JpaRepository<Pastel, Long> {
    // Solo los pasteles que no han sido "eliminados"
    List<Pastel> findByActivoTrue();
}
