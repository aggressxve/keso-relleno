CREATE SCHEMA IF NOT EXISTS `keso` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `keso` ;

-- =========================================
-- TABLA: Clientes
-- =========================================

CREATE TABLE IF NOT EXISTS Clientes (
    cliente_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(255)
);


-- =========================================
-- TABLA: Credenciales
-- (separada de Clientes por seguridad: aquí vive
-- todo lo relacionado al login/autenticación)
-- =========================================

CREATE TABLE IF NOT EXISTS Credenciales (
    credencial_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cliente_id BIGINT NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    ultimo_login DATETIME,
    intentos_fallidos INT NOT NULL DEFAULT 0,
    bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_credenciales_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES Clientes(cliente_id)
        ON DELETE CASCADE
);


-- =========================================
-- TABLA: Roles
-- =========================================

CREATE TABLE IF NOT EXISTS Roles (
    rol_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL
);


-- =========================================
-- TABLA: Panes
-- =========================================

CREATE TABLE IF NOT EXISTS Panes (
    pan_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sabor_pan VARCHAR(255) NOT NULL
);


-- =========================================
-- TABLA: Rellenos
-- =========================================

CREATE TABLE IF NOT EXISTS Rellenos (
    relleno_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sabor_relleno VARCHAR(255) NOT NULL
);


-- =========================================
-- TABLA: Cubiertas
-- =========================================

CREATE TABLE IF NOT EXISTS Cubiertas (
    cubierta_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sabor_cubierta VARCHAR(255) NOT NULL
);


-- =========================================
-- TABLA: Toppings
-- =========================================

CREATE TABLE IF NOT EXISTS Toppings (
    topping_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sabor_topping VARCHAR(255) NOT NULL
);


-- =========================================
-- TABLA: Direcciones
-- =========================================

CREATE TABLE IF NOT EXISTS Direcciones (
    cliente_id BIGINT,
    direccion_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lugar_entrega VARCHAR(255) NOT NULL,

    CONSTRAINT fk_direcciones_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES Clientes(cliente_id)
);


-- =========================================
-- TABLA: Empleado
-- =========================================

CREATE TABLE IF NOT EXISTS Empleado (
    empleado_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rol_id BIGINT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    correo BIGINT,

    CONSTRAINT fk_empleado_rol
        FOREIGN KEY (rol_id)
        REFERENCES Roles(rol_id)
);


-- =========================================
-- TABLA: Pasteles
-- =========================================

CREATE TABLE IF NOT EXISTS Pasteles (
    pastel_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    pan_id BIGINT NOT NULL,
    relleno_id BIGINT NOT NULL,
    cubierta_id BIGINT NOT NULL,
    topping_id BIGINT NOT NULL,
    precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT fk_pasteles_pan
        FOREIGN KEY (pan_id)
        REFERENCES Panes(pan_id),

    CONSTRAINT fk_pasteles_relleno
        FOREIGN KEY (relleno_id)
        REFERENCES Rellenos(relleno_id),

    CONSTRAINT fk_pasteles_cubierta
        FOREIGN KEY (cubierta_id)
        REFERENCES Cubiertas(cubierta_id),

    CONSTRAINT fk_pasteles_topping
        FOREIGN KEY (topping_id)
        REFERENCES Toppings(topping_id)
);


-- =========================================
-- TABLA: Carrito
-- (cabecera del carrito activo de cada cliente)
-- =========================================

CREATE TABLE IF NOT EXISTS Carrito (
    carrito_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cliente_id BIGINT NOT NULL,
    estado ENUM('activo','abandonado','convertido') NOT NULL DEFAULT 'activo',
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_carrito_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES Clientes(cliente_id)
);


-- =========================================
-- TABLA: Carrito_Detalle
-- (los pasteles que el cliente agrega al carrito)
-- =========================================

CREATE TABLE IF NOT EXISTS Carrito_Detalle (
    detalle_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    carrito_id BIGINT NOT NULL,
    pastel_id BIGINT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_carritodetalle_carrito
        FOREIGN KEY (carrito_id)
        REFERENCES Carrito(carrito_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_carritodetalle_pastel
        FOREIGN KEY (pastel_id)
        REFERENCES Pasteles(pastel_id)
);


-- =========================================
-- TABLA: Ventas
-- =========================================
CREATE TABLE IF NOT EXISTS Ventas (
    venta_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subtotal DECIMAL(10,2) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_direccion BIGINT NOT NULL,
    cliente_id BIGINT NOT NULL,
    pastel_id BIGINT NOT NULL,
    empleado_id BIGINT,

    CONSTRAINT fk_ventas_direccion
        FOREIGN KEY (id_direccion)
        REFERENCES Direcciones(direccion_id),

    CONSTRAINT fk_ventas_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES Clientes(cliente_id),

    CONSTRAINT fk_ventas_pastel
        FOREIGN KEY (pastel_id)
        REFERENCES Pasteles(pastel_id),

    CONSTRAINT fk_ventas_empleado
        FOREIGN KEY (empleado_id)
        REFERENCES Empleado(empleado_id)
);