package com.keso.relleno.service;

import com.keso.relleno.repository.VentaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Lógica de las tarjetas/gráficas del panel administrativo.
 * Antes vivía dentro del controller (que además inyectaba el repositorio por campo);
 * ahora la capa web solo pide datos y los devuelve.
 */
@Service
public class DashboardService {

    private static final String[] MESES =
            {"Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};

    private final VentaRepository ventaRepository;

    public DashboardService(VentaRepository ventaRepository) {
        this.ventaRepository = ventaRepository;
    }

    // Pastel más vendido de esta semana (lunes a domingo). Vacío si no hubo ventas.
    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> topPastelSemana() {
        LocalDate lunes = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<Object[]> filas = ventaRepository.topPasteles(
                lunes.atStartOfDay(),
                lunes.plusDays(7).atStartOfDay(),
                PageRequest.of(0, 1));

        if (filas.isEmpty()) {
            return Optional.empty();
        }

        Object[] f = filas.get(0);
        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("nombre", f[0]);
        resultado.put("imagen", f[1]);
        resultado.put("ventas", ((Number) f[2]).longValue());
        return Optional.of(resultado);
    }

    // Pasteles vendidos por mes, de enero al mes actual
    @Transactional(readOnly = true)
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
