package com.keso.relleno.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pruebas unitarias puras: no arrancan Spring ni la base de datos.
 * Se inyectan a mano los valores @Value del servicio con ReflectionTestUtils.
 */
class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // HS256 necesita una clave de al menos 256 bits (32 bytes) codificada en Base64
        String secret = Base64.getEncoder()
                .encodeToString("0123456789abcdef0123456789abcdef".getBytes());
        ReflectionTestUtils.setField(jwtService, "secret", secret);
        ReflectionTestUtils.setField(jwtService, "expirationMs", 3_600_000L);
    }

    @Test
    @DisplayName("El token guarda y devuelve el correo y el rol")
    void genera_y_lee_el_correo_y_el_rol() {
        String token = jwtService.generateToken("luis@keso.com", "ROLE_CLIENTE");

        assertThat(jwtService.extractCorreo(token)).isEqualTo("luis@keso.com");
        assertThat(jwtService.extractRole(token)).isEqualTo("ROLE_CLIENTE");
    }

    @Test
    @DisplayName("El token es válido para el mismo usuario que lo solicitó")
    void el_token_es_valido_para_el_mismo_usuario() {
        String token = jwtService.generateToken("luis@keso.com", "ROLE_CLIENTE");

        UserDetails userDetails = User.withUsername("luis@keso.com")
                .password("x")
                .roles("CLIENTE") // -> autoridad "ROLE_CLIENTE"
                .build();

        assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
    }

    @Test
    @DisplayName("El token no sirve para otro usuario")
    void el_token_no_sirve_para_otro_usuario() {
        String token = jwtService.generateToken("luis@keso.com", "ROLE_CLIENTE");

        UserDetails otro = User.withUsername("otro@keso.com")
                .password("x")
                .roles("CLIENTE")
                .build();

        assertThat(jwtService.isTokenValid(token, otro)).isFalse();
    }

    @Test
    @DisplayName("Un token manipulado se rechaza")
    void un_token_falsificado_no_es_valido() {
        String token = jwtService.generateToken("luis@keso.com", "ROLE_CLIENTE");
        String manipulado = token.substring(0, token.length() - 2) + "xx";

        UserDetails userDetails = User.withUsername("luis@keso.com")
                .password("x")
                .roles("CLIENTE")
                .build();

        assertThat(jwtService.isTokenValid(manipulado, userDetails)).isFalse();
    }
}
