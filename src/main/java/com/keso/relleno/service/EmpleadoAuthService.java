package com.keso.relleno.service;

import com.keso.relleno.dto.EmpleadoAuthResponse;
import com.keso.relleno.dto.EmpleadoLoginRequest;
import com.keso.relleno.model.Empleado;
import com.keso.relleno.repository.EmpleadoRepository;
import com.keso.relleno.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Set;

@Service
public class EmpleadoAuthService {

    private final AuthenticationManager authenticationManager;
    private final EmpleadoRepository empleadoRepository;
    private final JwtService jwtService;

    public EmpleadoAuthService(
            AuthenticationManager authenticationManager,
            EmpleadoRepository empleadoRepository,
            JwtService jwtService
    ) {
        this.authenticationManager = authenticationManager;
        this.empleadoRepository = empleadoRepository;
        this.jwtService = jwtService;
    }

    public EmpleadoAuthResponse login(EmpleadoLoginRequest request) {
        if (request == null
                || request.correo() == null || request.correo().isBlank()
                || request.contrasena() == null || request.contrasena().isBlank()) {
            throw new IllegalArgumentException("Correo y contraseña son obligatorios");
        }

        String correo = request.correo().trim().toLowerCase(Locale.ROOT);
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(correo, request.contrasena())
        );

        Empleado empleado = empleadoRepository.findByCorreoIgnoreCase(authentication.getName());
        if (empleado == null || empleado.getRol() == null) {
            throw new IllegalStateException("No se pudo cargar el perfil del empleado autenticado");
        }

        String role = authentication.getAuthorities().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("El empleado autenticado no tiene permisos"))
                .getAuthority();
        if (!Set.of("ROLE_ADMIN", "ROLE_PASTELERO", "ROLE_VENDEDOR").contains(role)) {
            throw new BadCredentialsException("Credenciales inválidas");
        }
        String token = jwtService.generateToken(empleado.getCorreo(), role);

        return new EmpleadoAuthResponse(
                token,
                empleado.getIdEmpleado(),
                empleado.getNombre(),
                empleado.getCorreo(),
                empleado.getRol().getTitulo()
        );
    }
}
