package com.keso.relleno.controller;

import com.keso.relleno.dto.AuthResponse;
import com.keso.relleno.handler.GlobalExceptionHandler;
import com.keso.relleno.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Pruebas de la capa web con MockMvc "standalone": no arranca el servidor ni
 * la base de datos, solo el controller + el manejador global de errores.
 */
class AuthControllerTest {

    private AuthService authService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        authService = mock(AuthService.class);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new AuthController(authService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /auth/register devuelve 201 con datos válidos")
    void register_devuelve_201_con_datos_validos() throws Exception {
        when(authService.registrar(any())).thenReturn(
                new AuthResponse("token.jwt", 1L, "Luis", "luis@keso.com", "5512345678"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Luis","correo":"luis@keso.com","telefono":"5512345678","contrasena":"secreto123"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(content().string(containsString("token.jwt")));
    }

    @Test
    @DisplayName("POST /auth/register devuelve 400 si el correo es inválido")
    void register_devuelve_400_si_el_correo_es_invalido() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Luis","correo":"no-es-un-correo","telefono":"5512345678","contrasena":"secreto123"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("correo")));
    }
}
