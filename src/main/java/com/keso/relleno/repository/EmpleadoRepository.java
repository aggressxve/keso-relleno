package com.keso.relleno.repository;

import com.keso.relleno.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    Empleado findByCorreo(String correo);
    Empleado findByCorreoIgnoreCase(String correo);
    boolean existsByCorreo(String correo);
    boolean existsByCorreoIgnoreCase(String correo);
    boolean existsByCorreoIgnoreCaseAndIdEmpleadoNot(String correo, Long idEmpleado);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Empleado e where upper(e.rol.titulo) = upper(:titulo) and e.activo = true")
    List<Empleado> findActivosPorRolParaActualizar(@Param("titulo") String titulo);
}
