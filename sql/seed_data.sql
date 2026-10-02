USE `keso_db`;

-- Panes
INSERT INTO `panes` (`id_pan`, `nombre`) VALUES
(1, '3 leches'),
(2, 'Limón'),
(3, 'Naranja'),
(4, 'Marmoleado'),
(5, 'Chocolate'),
(6, 'Rompope'),
(7, 'Vainilla'),
(8, 'Zanahoria con nuez'),
(9, 'Queso crema y naranja'),
(10, 'Fresa'),
(11, 'Coco'),
(12, 'Moka')
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`);

-- Rellenos
INSERT INTO `rellenos` (`id_relleno`, `sabor_relleno`) VALUES
(1, 'Crema con oreo'),
(2, 'Chocolate'),
(3, 'Crema batida'),
(4, 'Fruta (fresa, durazno)'),
(5, 'Nuez'),
(6, 'Cajeta'),
(7, 'Mermelada'),
(8, 'Queso con mermelada'),
(9, 'Flan'),
(10, 'Trufa'),
(11, 'Ganache de chocolate (blanco u oscuro)'),
(12, 'Crema pastelera'),
(13, 'Crema con queso'),
(14, 'Crema de avellana'),
(15, 'Cheesecake'),
(16, 'crema batida con fresas'),
(17, 'crema batida con durazno'),
(18, 'crema batida con frutos rojos'),
(19, 'crema batida con nuez'),
(20, 'crema batida de chocolate y oreo')
ON DUPLICATE KEY UPDATE `sabor_relleno` = VALUES(`sabor_relleno`);

-- Cubiertas
INSERT INTO `cubiertas` (`id_cubierta`, `sabor_cubierta`) VALUES
(1, 'Chantilly'),
(2, 'Crema batida'),
(3, 'Ganache de chocolate'),
(4, 'Crema de mantequilla'),
(5, 'Fondant'),
(6, 'crema batida con fresas'),
(7, 'crema batida con durazno'),
(8, 'crema batida con mermelada de frutos rojos'),
(9, 'crema batida con nuez'),
(10, 'crema batida de chocolate y oreo'),
(11, 'crema batida de chocolate con fresa'),
(12, 'crema de mantequilla con nuez'),
(13, 'crema batida y coco rallado'),
(14, 'ganache de chocolate Turin semiamargo')
ON DUPLICATE KEY UPDATE `sabor_cubierta` = VALUES(`sabor_cubierta`);

-- Toppings
INSERT INTO `toppings` (`id_topping`, `sabor_topping`) VALUES
(1, 'Chispas de chocolate'),
(2, 'Fruta fresca'),
(3, 'Nuez picada'),
(4, 'Oreo triturada'),
(5, 'Coco rallado')
ON DUPLICATE KEY UPDATE `sabor_topping` = VALUES(`sabor_topping`);

-- Pasteles iniciales
INSERT INTO `pasteles` (`id_pastel`, `nombre`, `descripcion`, `numero_de_personas`, `precio`, `img`, `id_pan`, `id_relleno`, `id_cubierta`, `id_topping`) VALUES
(1, 'Tres leches de fresa', 'Pastel de 3 leches, bizcocho de vainilla, relleno de fresa con crema batida y cobertura de fresas con crema batida.', 15, 440.00, '/images/Fotos de Pasteles/3-leches-fresa.png', 7, 16, 6, 2),
(2, 'Tres leches de durazno', 'Pastel de 3 leches, bizcocho de vainilla, relleno de durazno con crema batida y cobertura de duraznos con crema batida.', 15, 420.00, '/images/Fotos de Pasteles/3-leches-durazno.png', 7, 17, 7, 2),
(3, 'Tres leches de frutos rojos', 'Pastel de 3 leches, bizcocho de vainilla, relleno de frutos rojos con crema batida y cobertura de mermelada de frutos rojos y crema batida.', 15, 420.00, '/images/Fotos de Pasteles/3-leches-frutos-rojos.png', 7, 18, 8, 2),
(4, 'Tres leches de nuez', 'Pastel de 3 leches, bizcocho de vainilla, relleno de nuez con crema batida y cobertura de nuez con crema batida.', 15, 420.00, '/images/Fotos de Pasteles/3-leches-nuez.png', 7, 19, 9, 3),
(5, 'Tres leches de oreo', 'Pastel de 3 leches, bizcocho de vainilla, relleno de oreo con crema batida de chocolate y cobertura de crema batida de chocolate y oreo.', 15, 420.00, '/images/Fotos de Pasteles/3-leches-oreo.png', 7, 20, 10, 4),
(6, 'Tres leches de chocolate con oreo', 'Pastel de 3 leches, bizcocho de chocolate, relleno de oreo con crema batida y cobertura de crema batida de chocolate y oreo.', 15, 420.00, '/images/Fotos de Pasteles/3-leches-chocolate-oreo.png', 5, 20, 10, 4),
(7, 'Tres leches de chocolate con fresa', 'Pastel de 3 leches, bizcocho de chocolate, relleno de fresa con crema batida y cobertura de fresa y crema batida de chocolate.', 15, 440.00, '/images/Fotos de Pasteles/3-leches-chocolate-fresa.png', 5, 16, 11, 2),
(8, 'Zanahoria con nuez', 'Pastel de zanahoria con nuez y crema de mantequilla y queso crema.', 15, 420.00, '/images/Fotos de Pasteles/zanahoria-crema-mantequilla.png', 8, 13, 12, 3),
(9, 'Tres leches con rompope', 'Pastel de 3 leches, bizcocho de vainilla, relleno de rompope con nuez, crema batida y cobertura de crema batida con nuez.', 15, 480.00, '/images/Fotos de Pasteles/3-leches-nuez.png', 6, 19, 9, 3),
(10, 'Tres leches y crema de coco', 'Pastel de 3 leches y crema de coco, bizcocho de vainilla, relleno de coco, queso crema y cobertura de crema batida y coco rallado.', 15, 420.00, '/images/Fotos de Pasteles/3-leches-coco.png', 7, 13, 13, 5),
(11, 'Matilda', 'Pastel Matilda, pan de chocolate tipo americano, relleno y decorado con ganache de chocolate Turin semiamargo.', 15, 520.00, '/images/Fotos de Pasteles/matilda.png', 5, 11, 14, 1),
(12, 'Flan', 'Flan clásico', 12, 320.00, '/images/Fotos de Pasteles/Flan.png', 7, 9, 1, 1)
ON DUPLICATE KEY UPDATE `nombre` = VALUES(`nombre`), `precio` = VALUES(`precio`);
