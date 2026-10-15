package com.keso.relleno.controller;

import com.keso.relleno.model.Cliente;
import com.keso.relleno.repository.ClienteRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/clientes")
public class ClienteAdminController {

    private final ClienteRepository clienteRepository;

    public ClienteAdminController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    // Solo los datos que necesita la tabla del panel (sin contraseñas ni relaciones circulares)
    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listar() {
        List<Map<String, Object>> resultado = new ArrayList<>();
        for (Cliente c : clienteRepository.findAll()) {
            List<Map<String, Object>> direcciones = new ArrayList<>();
            c.getDirecciones().forEach(d -> {
                Map<String, Object> dir = new LinkedHashMap<>();
                dir.put("lugarEntrega", d.getLugarEntrega());
                dir.put("ciudad", d.getCiudad());
                dir.put("codigoPostal", d.getCodigoPostal());
                direcciones.add(dir);
            });

            Map<String, Object> fila = new LinkedHashMap<>();
            fila.put("idCliente", c.getIdCliente());
            fila.put("nombre", c.getNombre());
            fila.put("telefono", c.getTelefono());
            fila.put("correo", c.getCorreo());
            fila.put("direcciones", direcciones);
            resultado.add(fila);
        }
        return resultado;
    }
}