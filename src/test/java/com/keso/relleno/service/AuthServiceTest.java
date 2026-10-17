package com.keso.relleno.service;

import com.keso.relleno.dto.AuthResponse;
import com.keso.relleno.dto.LoginRequest;
import com.keso.relleno.dto.RegistroRequest;
import com.keso.relleno.model.Cliente;
import com.keso.relleno.repository.ClienteRepository;
import com.keso.relleno.security.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas del AuthService con dependencias simuladas (Mockito).
 * No hay base de datos: se "finge" el comportamiento de los repositorios.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private ClienteRepository clienteRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;

    @InjectMocks private AuthService authService;

    @Test
    @DisplayName("Registrar rechaza un correo que ya existe")
    void registrar_rechaza_correo_duplicado() {
        when(clienteRepository.existsByCorreo("luis@keso.com")).thenReturn(true);

        RegistroRequest request = new RegistroRequest("Luis", "luis@keso.com", "5512345678", "secreto123");

        assertThatThrownBy(() -> authService.registrar(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("correo");

        // Nunca debe guardar si el correo está repetido
        verify(clienteRepository, never()).save(any());
    }

    @Test
    @DisplayName("Registrar cifra la contraseña y devuelve un token")
    void registrar_guarda_con_password_cifrado_y_devuelve_token() {
        when(clienteRepository.existsByCorreo("luis@keso.com")).thenReturn(false);
        when(passwordEncoder.encode("secreto123")).thenReturn("$2a$cifrado");
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(invocation -> {
            Cliente c = invocation.getArgument(0);
            c.setIdCliente(1L);
            return c;
        });
        when(jwtService.generateToken("luis@keso.com", "ROLE_CLIENTE")).thenReturn("token.jwt");

        AuthResponse response = authService.registrar(
                new RegistroRequest("Luis", "luis@keso.com", "5512345678", "secreto123"));

        assertThat(response.token()).isEqualTo("token.jwt");
        assertThat(response.idCliente()).isEqualTo(1L);
        assertThat(response.correo()).isEqualTo("luis@keso.com");

        // La contraseña guardada debe ser la cifrada, nunca la original
        verify(clienteRepository).save(argThat(c -> "$2a$cifrado".equals(c.getContrasena())));
    }

    @Test
    @DisplayName("Login devuelve token cuando las credenciales son correctas")
    void login_devuelve_token_cuando_las_credenciales_son_correctas() {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("luis@keso.com");
        // doReturn evita el problema de genéricos comodín de getAuthorities()
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_CLIENTE"))).when(auth).getAuthorities();
        when(authenticationManager.authenticate(any())).thenReturn(auth);

        Cliente cliente = new Cliente(1L, "Luis", "luis@keso.com", "5512345678");
        when(clienteRepository.findByCorreo("luis@keso.com")).thenReturn(cliente);
        when(jwtService.generateToken("luis@keso.com", "ROLE_CLIENTE")).thenReturn("token.jwt");

        AuthResponse response = authService.login(new LoginRequest("Luis@Keso.com", "secreto123"));

        assertThat(response.token()).isEqualTo("token.jwt");
        assertThat(response.idCliente()).isEqualTo(1L);
        assertThat(response.nombre()).isEqualTo("Luis");
    }

    @Test
    @DisplayName("Login de un empleado por la puerta de clientes falla con BadCredentials (no NPE)")
    void login_falla_si_el_usuario_no_es_cliente() {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("jefe@keso.com");
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(clienteRepository.findByCorreo("jefe@keso.com")).thenReturn(null);

        assertThatThrownBy(() -> authService.login(new LoginRequest("jefe@keso.com", "secreto123")))
                .isInstanceOf(BadCredentialsException.class);
    }
}
