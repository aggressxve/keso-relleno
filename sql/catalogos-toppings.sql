-- Datos iniciales del catálogo de toppings para el modelo Java actual.
-- Ejecutar después de iniciar el backend al menos una vez para que JPA cree las tablas.
USE `keso_pasteleria`;

INSERT INTO `Toppings` (`sabor_topping`)
SELECT 'Fresa'
WHERE NOT EXISTS (
    SELECT 1 FROM `Toppings` WHERE `sabor_topping` = 'Fresa'
);

INSERT INTO `Toppings` (`sabor_topping`)
SELECT 'Nuez'
WHERE NOT EXISTS (
    SELECT 1 FROM `Toppings` WHERE `sabor_topping` = 'Nuez'
);

INSERT INTO `Toppings` (`sabor_topping`)
SELECT 'Oreo'
WHERE NOT EXISTS (
    SELECT 1 FROM `Toppings` WHERE `sabor_topping` = 'Oreo'
);