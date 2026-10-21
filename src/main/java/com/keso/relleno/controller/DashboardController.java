package com.keso.relleno.controller;

import com.keso.relleno.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // Pastel más vendido de esta semana (lunes a domingo)
    @GetMapping("/top-pastel-semana")
    public ResponseEntity<Map<String, Object>> topPastelSemana() {
        return dashboardService.topPastelSemana()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    // Pasteles vendidos por mes, de enero al mes actual
    @GetMapping("/ventas-anuales")
    public List<Map<String, Object>> ventasAnuales() {
        return dashboardService.ventasAnuales();
    }
}
