package com.keso.relleno.config;

import com.keso.relleno.model.Empleado;
import com.keso.relleno.model.Rol;
import com.keso.relleno.repository.EmpleadoRepository;
import com.keso.relleno.repository.RolRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private final RolRepository rolRepository;
    private final EmpleadoRepository empleadoRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataInitializer(
            RolRepository rolRepository,
            EmpleadoRepository empleadoRepository,
            PasswordEncoder passwordEncoder,
            @Value("${admin.email:admin@keso.com}") String adminEmail,
            @Value("${admin.password:}") String adminPassword
    ) {
        this.rolRepository = rolRepository;
        this.empleadoRepository = empleadoRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {

        Rol admin = rolRepository.findByTitulo("ADMIN")
                .orElseGet(() -> rolRepository.save(
                        new Rol(null, "ADMIN")));

        rolRepository.findByTitulo("PASTELERO")
                .orElseGet(() -> rolRepository.save(
                        new Rol(null, "PASTELERO")));

        rolRepository.findByTitulo("VENDEDOR")
                .orElseGet(() -> rolRepository.save(
                        new Rol(null, "VENDEDOR")));

        if (adminEmail.isBlank()) {
            throw new IllegalStateException("ADMIN_EMAIL no puede estar vacío.");
        }

        String correoAdmin = adminEmail.trim().toLowerCase(java.util.Locale.ROOT);
        Empleado adminEmpleado = empleadoRepository.findByCorreoIgnoreCase(correoAdmin);
        if (adminEmpleado == null
                || adminEmpleado.getContrasena() == null
                || adminEmpleado.getContrasena().isBlank()) {
            if (adminPassword.isBlank()) {
                throw new IllegalStateException(
                        "Define ADMIN_PASSWORD para crear o habilitar la cuenta inicial de administrador."
                );
            }

            if (adminEmpleado == null) {
                adminEmpleado = new Empleado();
                adminEmpleado.setNombre("Administrador");
                adminEmpleado.setCorreo(correoAdmin);
            }
            adminEmpleado.setContrasena(passwordEncoder.encode(adminPassword));
            adminEmpleado.setActivo(true);
            adminEmpleado.setRol(admin);
            empleadoRepository.save(adminEmpleado);

            logger.info("Se creó o habilitó la cuenta inicial de administrador {}", correoAdmin);
        }
    }
}
