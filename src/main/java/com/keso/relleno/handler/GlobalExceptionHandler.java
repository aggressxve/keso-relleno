package com.keso.relleno.handler;

import com.keso.relleno.exception.CarritoNotFoundException;
import com.keso.relleno.exception.ClienteConPedidosException;
import com.keso.relleno.exception.ClienteNotFoundException;
import com.keso.relleno.exception.DireccionNotFoundException;
import com.keso.relleno.exception.EmpleadoNotFoundException;
import com.keso.relleno.exceptions.CorreoYaRegistradoException;
import com.keso.relleno.exceptions.RolNoEncontradoException;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Convierte las excepciones que lanza la app en respuestas JSON claras y con el
 * código HTTP correcto. Antes, casi cualquier error terminaba en un 500 genérico.
 *
 * Se devuelven DOS claves con el mismo texto:
 *  - "error": la usan checkout y el panel.
 *  - "mensaje": la usa la pantalla de registro.
 * Así el front sigue funcionando sin cambios.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ---------- 400: datos inválidos (Bean Validation) ----------

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleBodyValidation(MethodArgumentNotValidException ex) {
        Map<String, String> detalles = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            // putIfAbsent: si un campo tiene 2 errores, mostramos el primero
            detalles.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        String mensaje = detalles.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Datos inválidos");
        return build(HttpStatus.BAD_REQUEST, mensaje, detalles);
    }

    // Validación de parámetros sueltos (@RequestParam, @PathVariable con @Validated)
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleParamValidation(ConstraintViolationException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    // Reglas de negocio que se validan a mano en los services
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadArgument(IllegalArgumentException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    // JSON mal formado o con tipos equivocados: es culpa del cliente, no un 500
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadable(
            org.springframework.http.converter.HttpMessageNotReadableException ex) {
        return build(HttpStatus.BAD_REQUEST, "El cuerpo de la petición no es un JSON válido", null);
    }

    // ---------- 401: no autenticado ----------

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuth(AuthenticationException ex) {
        // El front espera 401 para mostrar "correo o contraseña incorrectos"
        return build(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos", null);
    }

    // ---------- 403: autenticado pero sin permisos ----------

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, "No tienes permisos para realizar esta acción", null);
    }

    // ---------- 404: recurso no encontrado ----------

    @ExceptionHandler({
            ClienteNotFoundException.class,
            CarritoNotFoundException.class,
            DireccionNotFoundException.class,
            EmpleadoNotFoundException.class,
            RolNoEncontradoException.class
    })
    public ResponseEntity<Map<String, Object>> handleNotFound(RuntimeException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    // Un archivo estático que no existe (favicon, etc.) no debe ser un 500
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResource(NoResourceFoundException ex) {
        return build(HttpStatus.NOT_FOUND, "Recurso no encontrado", null);
    }

    // ---------- 409: conflicto (duplicados, estado incompatible) ----------

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(IllegalStateException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    @ExceptionHandler(CorreoYaRegistradoException.class)
    public ResponseEntity<Map<String, Object>> handleCorreo(CorreoYaRegistradoException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    // No se puede borrar un cliente que ya tiene pedidos (se perdería el historial)
    @ExceptionHandler(ClienteConPedidosException.class)
    public ResponseEntity<Map<String, Object>> handleClienteConPedidos(ClienteConPedidosException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        return build(HttpStatus.CONFLICT,
                "No se pudo guardar por una restricción de la base de datos", null);
    }

    // ---------- 500: cualquier cosa no prevista ----------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        // Se registra el stacktrace completo para poder depurar, pero NO se
        // expone el detalle interno al cliente (buena práctica de seguridad).
        log.error("Error no controlado", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado en el servidor", null);
    }

    // ---------- Helper ----------

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String mensaje, Map<String, String> detalles) {
        String texto = (mensaje == null || mensaje.isBlank()) ? status.getReasonPhrase() : mensaje;
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", texto);
        body.put("mensaje", texto);
        if (detalles != null && !detalles.isEmpty()) {
            body.put("detalles", detalles);
        }
        return ResponseEntity.status(status).body(body);
    }
}
