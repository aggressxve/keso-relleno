package com.keso.relleno.controller;

import com.keso.relleno.exception.ClienteNotFoundException;
import com.keso.relleno.model.Cliente;
import com.keso.relleno.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ClienteController {
    private final ClienteService clienteService;

    @Autowired
    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    private void verificarPropietario(long id, Authentication authentication) {
        Cliente cliente = clienteService.findByCorreo(authentication.getName());
        if (cliente == null || !cliente.getIdCliente().equals(id)) {
            throw new AccessDeniedException("No tienes acceso a este recurso");
        }
    }

    //se mapea getCliente
    @GetMapping("/clientes")
    public List<Cliente> getClientes(){
        return clienteService.getCliente();
    }

    //se mapea getCliente po id
    @GetMapping("/cliente/{id}")
    public ResponseEntity<Cliente> mostrarClientePorId(
            @PathVariable long id,
            Authentication authentication
    ){
        verificarPropietario(id, authentication);
        try {
            return new ResponseEntity<>(clienteService.mostrarClientePorId(id),
                    HttpStatus.OK);
        }catch (ClienteNotFoundException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    //se mapea createCliente
    @PostMapping("/create-cliente")
    public ResponseEntity<Cliente> createCliente(@RequestBody Cliente newCliente){

        Cliente clienteByCorreo = clienteService.findByCorreo(newCliente.getCorreo());

        if (clienteByCorreo != null){
            return new ResponseEntity<>(clienteByCorreo, HttpStatus.CONFLICT);
        }

        Cliente clienteByTelefono = clienteService.findByTelefono(newCliente.getTelefono());

        if (clienteByTelefono != null){
            return new ResponseEntity<>(clienteByTelefono, HttpStatus.CONFLICT);
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clienteService.createCliente(newCliente));
    }

    //se mapea actualizarCliente
    @PutMapping("/cliente/{id}")
    public ResponseEntity<Cliente> actualizarCliente(
            @PathVariable long id,
            @RequestBody Cliente clienteActualizar,
            Authentication authentication
    ){
        verificarPropietario(id, authentication);
        try {
            return new ResponseEntity<>(
                    clienteService.actualizarCliente(id, clienteActualizar),
                    HttpStatus.OK);
        }catch (ClienteNotFoundException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    //se mapea eliminarCliente
    @DeleteMapping("/cliente/{id}")
    public ResponseEntity<Void> eliminarCliente(
            @PathVariable Long id,
            Authentication authentication
    ){
        verificarPropietario(id, authentication);
        try {
            clienteService.eliminarCliente(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }catch (ClienteNotFoundException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
















}
