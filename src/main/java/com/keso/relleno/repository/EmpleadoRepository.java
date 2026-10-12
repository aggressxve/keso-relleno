package com.keso.relleno.repository;

import com.keso.relleno.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    Empleado findByCorreo(String correo);
    Empleado findByCorreoIgnoreCase(String correo);
    boolean existsByCorreo(String correo);
    boolean existsByCorreoIgnoreCase(String correo);
}
