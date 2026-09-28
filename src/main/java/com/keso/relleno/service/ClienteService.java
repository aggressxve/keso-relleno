package com.keso.relleno.service;

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

    public Optional<Cliente> findByCorreo(String correo){
         return clienteRepository.findByCorreo(correo);
    }
    public Optional<Cliente> findByTelefono(String telefono){
         return clienteRepository.findByTelefono(telefono);
    }


}
