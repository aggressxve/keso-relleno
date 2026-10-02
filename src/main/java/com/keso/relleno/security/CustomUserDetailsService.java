package com.keso.relleno.security;

import com.keso.relleno.model.Cliente;
import com.keso.relleno.repository.ClienteRepository;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final ClienteRepository clienteRepository;

    public CustomUserDetailsService(
            ClienteRepository clienteRepository
    ) {
        this.clienteRepository = clienteRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String correo)
            throws UsernameNotFoundException {

        Cliente cliente = clienteRepository
                .findByCorreo(correo); // Revisar las excepciones

        return User.builder()
                .username(cliente.getCorreo())
                .password(cliente.getContrasena())
                .roles("CLIENTE")
                .build();
    }
}