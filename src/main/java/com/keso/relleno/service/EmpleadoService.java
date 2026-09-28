package com.keso.relleno.service;

import com.keso.relleno.exception.EmpleadoNotFoundException;
import com.keso.relleno.model.Empleado;
import com.keso.relleno.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;

    @Autowired
    public EmpleadoService(EmpleadoRepository empleadoRepository) {
        this.empleadoRepository = empleadoRepository;
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
        return empleadoRepository.findByCorreo(correo);
    }

    // Método para crear un empleado
    public Empleado crearEmpleado(Empleado empleado) {
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
