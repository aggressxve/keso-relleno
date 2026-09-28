package com.keso.relleno.service;

import com.keso.relleno.exception.ClienteNotFoundException;
import com.keso.relleno.model.Cliente;
import com.keso.relleno.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {
    private final ClienteRepository clienteRepository;

     @Autowired
    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    // Aqui se obtiene a todos los clientes
    public List<Cliente> getCliente(){
         return clienteRepository.findAll();
    }

    //Aqui se crea cliente
    public Cliente createCliente(Cliente newCliente){
         return clienteRepository.save(newCliente);
    }

    //aqui se obtiene cliente por id
    public Cliente mostrarClientePorId(Long id){
         return clienteRepository.findById(id)
                 .orElseThrow(()-> new ClienteNotFoundException(id));
    }

    //aqui se modifica cliente ya existente
    public Cliente actualizarCliente(Long id, Cliente clienteActualizado){
         Cliente cliente = clienteRepository.findById(id)
                 .orElseThrow(()-> new ClienteNotFoundException(id));

         cliente.setNombre(clienteActualizado.getNombre());
         cliente.setCorreo(clienteActualizado.getCorreo());
         cliente.setTelefono(clienteActualizado.getTelefono());

         return clienteRepository.save(cliente);
    }

    //aqui se elimina cliente
    public void eliminarCliente(Long id){
         Cliente cliente = clienteRepository.findById(id)
                 .orElseThrow(() -> new ClienteNotFoundException(id));

         clienteRepository.delete(cliente);
    }


    public Cliente findByCorreo(String correo){
         return clienteRepository.findByCorreo(correo);
    }
    public Cliente findByTelefono(String telefono){
         return clienteRepository.findByTelefono(telefono);
    }


}
