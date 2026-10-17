package com.keso.relleno.service;

import com.keso.relleno.dto.AuthResponse;
import com.keso.relleno.dto.LoginRequest;
import com.keso.relleno.dto.RegistroRequest;

import com.keso.relleno.model.Cliente;

import com.keso.relleno.repository.ClienteRepository;

import com.keso.relleno.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthService {

    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            ClienteRepository clienteRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse registrar(RegistroRequest request) {

        String correo = request.correo().trim().toLowerCase(Locale.ROOT);

        if (clienteRepository.existsByCorreo(correo)) {
            throw new IllegalStateException("El correo ya está registrado");
        }

        if (clienteRepository.findByTelefono(request.telefono()) != null) {
            throw new IllegalStateException("El teléfono ya está registrado");
        }

        Cliente cliente = new Cliente();
        cliente.setNombre(request.nombre());
        cliente.setCorreo(correo);
        cliente.setTelefono(request.telefono());
        cliente.setContrasena(passwordEncoder.encode(request.contrasena()));

        Cliente clienteGuardado = clienteRepository.save(cliente);

        String token = jwtService.generateToken(clienteGuardado.getCorreo(), "ROLE_CLIENTE");

        return new AuthResponse(
                token,
                clienteGuardado.getIdCliente(),
                clienteGuardado.getNombre(),
                clienteGuardado.getCorreo(),
                clienteGuardado.getTelefono()
        );
    }

    public AuthResponse login(LoginRequest request) {

        String correo = request.correo().trim().toLowerCase(Locale.ROOT);

        // 1) Spring Security comprueba correo + contraseña.
        //    Si están mal lanza BadCredentialsException -> el handler global la vuelve 401.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(correo, request.contrasena())
        );

        // 2) Busca el cliente. Si el que se autenticó fue un EMPLEADO, aquí es null:
        //    significa que intentó entrar por la puerta de clientes -> credenciales inválidas.
        //    (Antes esto provocaba un NullPointerException en la siguiente línea.)
        Cliente cliente = clienteRepository.findByCorreo(authentication.getName());
        if (cliente == null) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        // 3) El rol se toma del propio token de autenticación, no se asume "ROLE_CLIENTE".
        String rol = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_CLIENTE");

        String token = jwtService.generateToken(cliente.getCorreo(), rol);

        return new AuthResponse(
                token,
                cliente.getIdCliente(),
                cliente.getNombre(),
                cliente.getCorreo(),
                cliente.getTelefono()
        );
    }
}