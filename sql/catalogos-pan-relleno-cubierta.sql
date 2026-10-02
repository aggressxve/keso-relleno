-- Catálogos base tomados de las opciones existentes en el panel.
-- Ejecutar después de iniciar el backend al menos una vez para que JPA cree las tablas.
USE `keso_pasteleria`;

-- Panes
INSERT INTO `Panes` (`nombre`)
SELECT '3 leches'
WHERE NOT EXISTS (
    SELECT 1 FROM `Panes` WHERE `nombre` = '3 leches'
);

INSERT INTO `Panes` (`nombre`)
SELECT 'Limón'
WHERE NOT EXISTS (
    SELECT 1 FROM `Panes` WHERE `nombre` = 'Limón'
);

INSERT INTO `Panes` (`nombre`)
SELECT 'Naranja'
WHERE NOT EXISTS (
    SELECT 1 FROM `Panes` WHERE `nombre` = 'Naranja'
);

INSERT INTO `Panes` (`nombre`)
SELECT 'Marmoleado'
WHERE NOT EXISTS (
    SELECT 1 FROM `Panes` WHERE `nombre` = 'Marmoleado'
);

INSERT INTO `Panes` (`nombre`)
SELECT 'Chocolate'
WHERE NOT EXISTS (
    SELECT 1 FROM `Panes` WHERE `nombre` = 'Chocolate'
);

INSERT INTO `Panes` (`nombre`)
SELECT 'Rompope'
WHERE NOT EXISTS (
    SELECT 1 FROM `Panes` WHERE `nombre` = 'Rompope'
);

INSERT INTO `Panes` (`nombre`)
SELECT 'Vainilla'
WHERE NOT EXISTS (
    SELECT 1 FROM `Panes` WHERE `nombre` = 'Vainilla'
);

INSERT INTO `Panes` (`nombre`)
SELECT 'Zanahoria con nuez'
WHERE NOT EXISTS (
    SELECT 1 FROM `Panes` WHERE `nombre` = 'Zanahoria con nuez'
);

INSERT INTO `Panes` (`nombre`)
SELECT 'Queso crema y naranja'
WHERE NOT EXISTS (
    SELECT 1 FROM `Panes` WHERE `nombre` = 'Queso crema y naranja'
);

INSERT INTO `Panes` (`nombre`)
SELECT 'Fresa'
WHERE NOT EXISTS (
    SELECT 1 FROM `Panes` WHERE `nombre` = 'Fresa'
);

INSERT INTO `Panes` (`nombre`)
SELECT 'Coco'
WHERE NOT EXISTS (
    SELECT 1 FROM `Panes` WHERE `nombre` = 'Coco'
);

INSERT INTO `Panes` (`nombre`)
SELECT 'Moka'
WHERE NOT EXISTS (
    SELECT 1 FROM `Panes` WHERE `nombre` = 'Moka'
);


-- Rellenos
INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Crema con oreo'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Crema con oreo'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Chocolate'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Chocolate'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Crema batida'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Crema batida'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Fruta (fresa, durazno)'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Fruta (fresa, durazno)'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Nuez'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Nuez'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Cajeta'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Cajeta'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Mermelada'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Mermelada'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Queso con mermelada'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Queso con mermelada'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Flan'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Flan'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Trufa'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Trufa'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Ganache de chocolate (blanco u oscuro)'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Ganache de chocolate (blanco u oscuro)'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Crema pastelera'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Crema pastelera'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Crema con queso'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Crema con queso'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Crema de avellana'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Crema de avellana'
);

INSERT INTO `Rellenos` (`sabor_relleno`)
SELECT 'Cheesecake'
WHERE NOT EXISTS (
    SELECT 1 FROM `Rellenos` WHERE `sabor_relleno` = 'Cheesecake'
);


-- Cubiertas
INSERT INTO `Cubiertas` (`sabor_cubierta`)
SELECT 'Chantilly'
WHERE NOT EXISTS (
    SELECT 1 FROM `Cubiertas` WHERE `sabor_cubierta` = 'Chantilly'
);

INSERT INTO `Cubiertas` (`sabor_cubierta`)
SELECT 'Crema batida'
WHERE NOT EXISTS (
    SELECT 1 FROM `Cubiertas` WHERE `sabor_cubierta` = 'Crema batida'
);

INSERT INTO `Cubiertas` (`sabor_cubierta`)
SELECT 'Ganache de chocolate'
WHERE NOT EXISTS (
    SELECT 1 FROM `Cubiertas` WHERE `sabor_cubierta` = 'Ganache de chocolate'
);

INSERT INTO `Cubiertas` (`sabor_cubierta`)
SELECT 'Crema de mantequilla'
WHERE NOT EXISTS (
    SELECT 1 FROM `Cubiertas` WHERE `sabor_cubierta` = 'Crema de mantequilla'
);

INSERT INTO `Cubiertas` (`sabor_cubierta`)
SELECT 'Fondant'
WHERE NOT EXISTS (
    SELECT 1 FROM `Cubiertas` WHERE `sabor_cubierta` = 'Fondant'
);
