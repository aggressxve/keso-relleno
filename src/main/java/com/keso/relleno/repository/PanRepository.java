package com.keso.relleno.repository;

import com.keso.relleno.model.Pan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PanRepository extends JpaRepository<Pan, Long> {
}
