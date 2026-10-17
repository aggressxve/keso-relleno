package com.keso.relleno.repository;

import com.keso.relleno.model.Venta;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    @Query("""
        SELECT p.nombre, p.urlFoto, COALESCE(SUM(v.cantidad), 0)
        FROM Venta v JOIN v.pastel p
        WHERE v.fecha >= :desde AND v.fecha < :hasta
        GROUP BY p.idPastel, p.nombre, p.urlFoto
        ORDER BY COALESCE(SUM(v.cantidad), 0) DESC
    """)
    List<Object[]> topPasteles(@Param("desde") LocalDateTime desde,
                               @Param("hasta") LocalDateTime hasta,
                               Pageable pageable);

    @Query("""
        SELECT MONTH(v.fecha), COALESCE(SUM(v.cantidad), 0)
        FROM Venta v
        WHERE YEAR(v.fecha) = :anio
        GROUP BY MONTH(v.fecha)
        ORDER BY MONTH(v.fecha)
    """)
    List<Object[]> ventasPorMes(@Param("anio") int anio);

    // ¿El cliente ya tiene pedidos? Se usa para impedir borrarlo y no perder historial.
    boolean existsByCliente_IdCliente(Long idCliente);
}