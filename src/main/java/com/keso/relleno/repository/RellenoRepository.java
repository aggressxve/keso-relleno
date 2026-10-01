package com.keso.relleno.repository;

import com.keso.relleno.model.Relleno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RellenoRepository extends JpaRepository<Relleno, Long> {
}
