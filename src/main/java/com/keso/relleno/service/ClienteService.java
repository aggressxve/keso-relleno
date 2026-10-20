package com.keso.relleno.service;

import com.keso.relleno.exception.ClienteNotFoundException;
import com.keso.relleno.exception.ClienteConPedidosException;
import com.keso.relleno.exceptions.CorreoYaRegistradoException;
import com.keso.relleno.model.Cliente;
import com.keso.relleno.repository.ClienteRepository;
import com.keso.relleno.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ClienteService {
    private final ClienteRepository clienteRepository;
    private final VentaRepository ventaRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public ClienteService(ClienteRepository clienteRepository, VentaRepository ventaRepository, PasswordEncoder passwordEncoder) {
        this.clienteRepository = clienteRepository;
        this.ventaRepository = ventaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Aqui se obtiene a todos los clientes
    public List<Cliente> getCliente(){
         return clienteRepository.findAll();
    }

    //Aqui se crea cliente
    public Cliente createCliente(Cliente newCliente){
         if(clienteRepository.existsByCorreo(newCliente.getCorreo())){
             throw new CorreoYaRegistradoException(newCliente.getCorreo());
         }

         newCliente.setContrasena(
                 passwordEncoder.encode(
                         newCliente.getContrasena()
                 )
         );
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
        cliente.setDireccion(null);
        clienteRepository.saveAndFlush(cliente);
         clienteRepository.delete(cliente);
    }

    // Eliminar un cliente desde el panel de administración.
    // Se bloquea si el cliente ya tiene pedidos: la relación Cliente -> Venta es
    // en cascada, así que un delete borraría también su historial de compras.
    @Transactional
    public void eliminarClienteDesdePanel(Long id){
         Cliente cliente = clienteRepository.findById(id)
                 .orElseThrow(() -> new ClienteNotFoundException(id));

         if (ventaRepository.existsByCliente_IdCliente(id)) {
             throw new ClienteConPedidosException(id);
         }
        cliente.setDireccion(null);
        clienteRepository.saveAndFlush(cliente);
         clienteRepository.delete(cliente);
    }


    public Cliente findByCorreo(String correo){
         return clienteRepository.findByCorreo(correo);
    }
    public Cliente findByTelefono(String telefono){
         return clienteRepository.findByTelefono(telefono);
    }

    // Datos que consume la tabla de clientes del panel (sin contraseñas ni relaciones circulares).
    // Antes este mapeo estaba en ClienteAdminController; ahora vive en la capa de servicio.
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarResumen() {
        List<Map<String, Object>> resultado = new ArrayList<>();
        for (Cliente c : clienteRepository.findAll()) {
            List<Map<String, Object>> direcciones = new ArrayList<>();
            c.getDirecciones().forEach(d -> {
                Map<String, Object> dir = new LinkedHashMap<>();
                dir.put("lugarEntrega", d.getLugarEntrega());
                dir.put("ciudad", d.getCiudad());
                dir.put("codigoPostal", d.getCodigoPostal());
                direcciones.add(dir);
            });

            Map<String, Object> fila = new LinkedHashMap<>();
            fila.put("idCliente", c.getIdCliente());
            fila.put("nombre", c.getNombre());
            fila.put("telefono", c.getTelefono());
            fila.put("correo", c.getCorreo());
            fila.put("direcciones", direcciones);
            resultado.add(fila);
        }
        return resultado;
    }


}
