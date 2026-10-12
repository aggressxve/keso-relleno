package com.keso.relleno.service;

import com.keso.relleno.exception.EmpleadoNotFoundException;
import com.keso.relleno.model.Empleado;
import com.keso.relleno.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public EmpleadoService(
            EmpleadoRepository empleadoRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.empleadoRepository = empleadoRepository;
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
    public Empleado crearEmpleado(Empleado empleado) {
        if (empleado.getNombre() == null || empleado.getNombre().isBlank()
                || empleado.getCorreo() == null || empleado.getCorreo().isBlank()
                || empleado.getRol() == null || empleado.getRol().getIdRol() == null) {
            throw new IllegalArgumentException("Nombre, correo y perfil son obligatorios");
        }
        empleado.setCorreo(empleado.getCorreo().trim().toLowerCase(Locale.ROOT));
        if (empleado.getContrasena() == null || empleado.getContrasena().length() < 8) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 8 caracteres");
        }
        empleado.setContrasena(passwordEncoder.encode(empleado.getContrasena()));
        if (empleado.getActivo() == null) {
            empleado.setActivo(true);
        }
        return empleadoRepository.save(empleado);
    }

    // Método para actualizar un empleado
    public Empleado actualizarEmpleado(Empleado empleado, Long id){
        return empleadoRepository.findById(id)
                .map(data ->{
                    data.setNombre(empleado.getNombre());
                    data.setCorreo(empleado.getCorreo());
                    data.setRol(empleado.getRol());
                    return empleadoRepository.save(data);
                })
                .orElseThrow(() -> new EmpleadoNotFoundException(id));
    }

    // Método para eliminar un Empleado
    public void eliminarEmpleadoId(Long id) {
        if (empleadoRepository.existsById(id)) {
            empleadoRepository.deleteById(id);
        }else{
            throw new EmpleadoNotFoundException(id);
        }
    }


}
