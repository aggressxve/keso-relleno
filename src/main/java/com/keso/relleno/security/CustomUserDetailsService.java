package com.keso.relleno.security;

import com.keso.relleno.model.Cliente;
import com.keso.relleno.model.Empleado;
import com.keso.relleno.repository.ClienteRepository;
import com.keso.relleno.repository.EmpleadoRepository;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final ClienteRepository clienteRepository;
    private final EmpleadoRepository empleadoRepository;

    public CustomUserDetailsService(
            ClienteRepository clienteRepository,
            EmpleadoRepository empleadoRepository
    ) {
        this.clienteRepository = clienteRepository;
        this.empleadoRepository = empleadoRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String correo)
            throws UsernameNotFoundException {

        String correoNormalizado = correo.trim().toLowerCase(Locale.ROOT);
        Empleado empleado = empleadoRepository.findByCorreoIgnoreCase(correoNormalizado);
        if (empleado != null) {
            if (empleado.getRol() == null || empleado.getRol().getTitulo() == null) {
                throw new UsernameNotFoundException("Empleado sin rol asignado");
            }

            return User.builder()
                    .username(empleado.getCorreo())
                    .password(empleado.getContrasena())
                    .roles(empleado.getRol().getTitulo().toUpperCase(Locale.ROOT))
                    .disabled(!Boolean.TRUE.equals(empleado.getActivo()))
                    .build();
        }

        Cliente cliente = clienteRepository.findByCorreo(correoNormalizado);
        if (cliente == null) {
            throw new UsernameNotFoundException("No se encontró el usuario");
        }

        return User.builder()
                .username(cliente.getCorreo())
                .password(cliente.getContrasena())
                .roles("CLIENTE")
                .build();
    }
}