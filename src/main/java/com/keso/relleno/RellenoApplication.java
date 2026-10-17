package com.keso.relleno;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la aplicación.
 *
 * La configuración (usuario/contraseña de la base de datos, secreto JWT, etc.)
 * se carga de dos formas, sin código frágil:
 *   1) Desde el archivo local .env, gracias a
 *      spring.config.import=optional:file:.env[.properties] (en application.properties).
 *   2) Desde variables de entorno reales (por ejemplo, en Docker).
 *
 * Antes había aquí System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME")),
 * que lanzaba NullPointerException si la variable no existía en el .env.
 */
@SpringBootApplication
public class RellenoApplication {

	public static void main(String[] args) {
		SpringApplication.run(RellenoApplication.class, args);
	}

}
