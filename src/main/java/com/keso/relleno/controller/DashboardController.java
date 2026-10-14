package com.keso.relleno.controller;

import com.keso.relleno.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private VentaRepository ventaRepository;

    private static final String[] MESES =
            {"Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"};

    // Pastel más vendido de esta semana (lunes a domingo)
    @GetMapping("/top-pastel-semana")
    public ResponseEntity<Map<String, Object>> topPastelSemana() {
        LocalDate lunes = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<Object[]> filas = ventaRepository.topPasteles(
                lunes.atStartOfDay(),
                lunes.plusDays(7).atStartOfDay(),
                PageRequest.of(0, 1));
        if (filas.isEmpty()) return ResponseEntity.noContent().build();

        Object[] f = filas.get(0);
        return ResponseEntity.ok(Map.of(
                "nombre", f[0],
                "imagen", f[1],
                "ventas", ((Number) f[2]).longValue()));
    }

    // Pasteles vendidos por mes, de enero al mes actual
    @GetMapping("/ventas-anuales")
    public List<Map<String, Object>> ventasAnuales() {
        LocalDate hoy = LocalDate.now();
        long[] porMes = new long[12];
        for (Object[] f : ventaRepository.ventasPorMes(hoy.getYear())) {
            porMes[((Number) f[0]).intValue() - 1] = ((Number) f[1]).longValue();
        }

        List<Map<String, Object>> resultado = new ArrayList<>();
        for (int i = 0; i < hoy.getMonthValue(); i++) {
            resultado.add(Map.of("mes", MESES[i], "cantidad", porMes[i]));
        }
        return resultado;
    }
}