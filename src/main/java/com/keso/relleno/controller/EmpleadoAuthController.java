package com.keso.relleno.controller;

import com.keso.relleno.dto.EmpleadoAuthResponse;
import com.keso.relleno.dto.EmpleadoLoginRequest;
import com.keso.relleno.model.Empleado;
import com.keso.relleno.repository.EmpleadoRepository;
import com.keso.relleno.service.EmpleadoAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Value;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth/admin")
public class EmpleadoAuthController {

    private final EmpleadoAuthService empleadoAuthService;
    private final EmpleadoRepository empleadoRepository;
    private final long expirationMs;

    public EmpleadoAuthController(
            EmpleadoAuthService empleadoAuthService,
            EmpleadoRepository empleadoRepository,
            @Value("${jwt.expiration-ms}") long expirationMs
    ) {
        this.empleadoAuthService = empleadoAuthService;
        this.empleadoRepository = empleadoRepository;
        this.expirationMs = expirationMs;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody EmpleadoLoginRequest request,
            HttpServletRequest servletRequest
    ) {
        try {
            EmpleadoAuthResponse authResponse = empleadoAuthService.login(request);
            ResponseCookie cookie = ResponseCookie.from("AUTH_TOKEN", authResponse.token())
                    .httpOnly(true)
                    .secure(servletRequest.isSecure())
                    .path("/")
                    .sameSite("Strict")
                    .maxAge(expirationMs / 1000)
                    .build();
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(Map.of(
                            "idEmpleado", authResponse.idEmpleado(),
                            "nombre", authResponse.nombre(),
                            "correo", authResponse.correo(),
                            "rol", authResponse.rol()
                    ));
        } catch (AuthenticationException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Correo o contraseña incorrectos"));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest servletRequest) {
        ResponseCookie cookie = ResponseCookie.from("AUTH_TOKEN", "")
                .httpOnly(true)
                .secure(servletRequest.isSecure())
                .path("/")
                .sameSite("Strict")
                .maxAge(0)
                .build();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        Empleado empleado = empleadoRepository.findByCorreoIgnoreCase(authentication.getName());
        if (empleado == null || empleado.getRol() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(Map.of(
                "idEmpleado", empleado.getIdEmpleado(),
                "nombre", empleado.getNombre(),
                "correo", empleado.getCorreo(),
                "rol", empleado.getRol().getTitulo()
        ));
    }
}
