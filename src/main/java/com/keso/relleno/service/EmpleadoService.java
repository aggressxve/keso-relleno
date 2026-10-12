package com.keso.relleno.service;

import com.keso.relleno.dto.EmpleadoUpdateRequest;
import com.keso.relleno.exception.EmpleadoNotFoundException;
import com.keso.relleno.model.Empleado;
import com.keso.relleno.model.Rol;
import com.keso.relleno.repository.EmpleadoRepository;
import com.keso.relleno.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    @Autowired
    public EmpleadoService(
            EmpleadoRepository empleadoRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.empleadoRepository = empleadoRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Método para traer todos los empleados
    public List<Empleado> mostrarEmpleados(){
        return empleadoRepository.findAll();
    }

    // Método para traer un empleado por Id
    public Empleado mostrarEmpleadoPorId(Long id) {
        return empleadoRepository.findById(id)
                .orElseThrow(() -> new EmpleadoNotFoundException(id));
    }

    // Método para traer un empleado por correo
    public Empleado findByCorreo(String correo) {
        return empleadoRepository.findByCorreoIgnoreCase(correo);
    }

    // Método para crear un empleado
    @Transactional
    public Empleado crearEmpleado(Empleado empleado) {
        if (empleado.getNombre() == null || empleado.getNombre().isBlank()
                || empleado.getCorreo() == null || empleado.getCorreo().isBlank()
                || empleado.getRol() == null || empleado.getRol().getIdRol() == null) {
            throw new IllegalArgumentException("Nombre, correo y perfil son obligatorios");
        }
        String nombre = empleado.getNombre().trim();
        if (nombre.length() > 255) {
            throw new IllegalArgumentException("El nombre no puede exceder 255 caracteres");
        }
        empleado.setCorreo(empleado.getCorreo().trim().toLowerCase(Locale.ROOT));
        if (empleado.getCorreo().length() > 255
                || !EMAIL_PATTERN.matcher(empleado.getCorreo()).matches()) {
            throw new IllegalArgumentException("El correo no tiene un formato válido");
        }
        if (empleadoRepository.existsByCorreoIgnoreCase(empleado.getCorreo())) {
            throw new IllegalArgumentException("Ya existe un empleado con ese correo");
        }
        if (empleado.getContrasena() == null || empleado.getContrasena().length() < 8) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres");
        }

        Rol rol = rolRepository.findById(empleado.getRol().getIdRol())
                .orElseThrow(() -> new IllegalArgumentException("El perfil seleccionado no existe"));
        empleado.setNombre(nombre);
        empleado.setContrasena(passwordEncoder.encode(empleado.getContrasena()));
        empleado.setActivo(true);
        empleado.setRol(rol);
        return empleadoRepository.save(empleado);
    }

    // Método para actualizar un empleado
    @Transactional
    public Empleado actualizarEmpleado(EmpleadoUpdateRequest request, Long id, String adminCorreo) {
        if (request == null
                || request.nombre() == null || request.nombre().isBlank()
                || request.correo() == null || request.correo().isBlank()
                || request.idRol() == null
                || request.activo() == null) {
            throw new IllegalArgumentException("Nombre, correo, perfil y estado son obligatorios");
        }

        String correo = request.correo().trim().toLowerCase(Locale.ROOT);
        String nombre = request.nombre().trim();
        if (nombre.length() > 255 || correo.length() > 255 || !EMAIL_PATTERN.matcher(correo).matches()) {
            throw new IllegalArgumentException("El nombre o correo no tienen un formato válido");
        }
        if (request.contrasena() != null && !request.contrasena().isBlank()
                && request.contrasena().length() < 8) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres");
        }

        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new EmpleadoNotFoundException(id));
        if (empleadoRepository.existsByCorreoIgnoreCaseAndIdEmpleadoNot(correo, id)) {
            throw new IllegalArgumentException("Ya existe un empleado con ese correo");
        }

        Rol rol = rolRepository.findById(request.idRol())
                .orElseThrow(() -> new IllegalArgumentException("El perfil seleccionado no existe"));
        boolean esAdminActual = empleado.getRol() != null
                && "ADMIN".equalsIgnoreCase(empleado.getRol().getTitulo());
        boolean dejariaDeSerAdminActivo = esAdminActual
                && Boolean.TRUE.equals(empleado.getActivo())
                && (!request.activo() || !"ADMIN".equalsIgnoreCase(rol.getTitulo()));
        boolean esMismaCuenta = empleado.getCorreo().equalsIgnoreCase(adminCorreo);

        if (esMismaCuenta && !request.activo()) {
            throw new IllegalStateException("No puedes desactivar tu propia cuenta");
        }
        if (esMismaCuenta && !"ADMIN".equalsIgnoreCase(rol.getTitulo())) {
            throw new IllegalStateException("No puedes quitarte el perfil ADMIN");
        }
        if (dejariaDeSerAdminActivo
                && empleadoRepository.findActivosPorRolParaActualizar("ADMIN").size() <= 1) {
            throw new IllegalStateException("Debe permanecer al menos un administrador activo");
        }

        empleado.setNombre(nombre);
        empleado.setCorreo(correo);
        empleado.setRol(rol);
        empleado.setActivo(request.activo());
        if (request.contrasena() != null && !request.contrasena().isBlank()) {
            empleado.setContrasena(passwordEncoder.encode(request.contrasena()));
        }
        return empleadoRepository.save(empleado);
    }

    // Método para eliminar un Empleado
    @Transactional
    public void eliminarEmpleadoId(Long id, String adminCorreo) {
        Empleado empleado = empleadoRepository.findById(id)
                .orElseThrow(() -> new EmpleadoNotFoundException(id));
        if (!Boolean.TRUE.equals(empleado.getActivo())) {
            return;
        }

        boolean esMismaCuenta = empleado.getCorreo().equalsIgnoreCase(adminCorreo);
        boolean esAdmin = empleado.getRol() != null
                && "ADMIN".equalsIgnoreCase(empleado.getRol().getTitulo());
        if (esMismaCuenta) {
            throw new IllegalStateException("No puedes desactivar tu propia cuenta");
        }
        if (esAdmin
                && empleadoRepository.findActivosPorRolParaActualizar("ADMIN").size() <= 1) {
            throw new IllegalStateException("Debe permanecer al menos un administrador activo");
        }
        empleado.setActivo(false);
        empleadoRepository.save(empleado);
    }


}
