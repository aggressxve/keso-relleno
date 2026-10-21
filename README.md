# Keso Relleno 🍰

API REST + front-end para una pastelería: catálogo de pasteles, carrito de compras,
registro/login de clientes, panel administrativo (empleados, clientes, ventas y
estadísticas) y cobro de pedidos ("checkout").

> Proyecto académico desarrollado en equipo con **Java + Spring Boot**.
> Este repositorio incluye backend, front-end (HTML/CSS/JS) y configuración de Docker.

---

## 🧱 Tecnologías

| Área | Tecnología |
|------|------------|
| Lenguaje | Java 17 |
| Framework | Spring Boot 4.1.1 |
| Web | Spring MVC (REST) |
| Persistencia | Spring Data JPA + Hibernate |
| Base de datos | MySQL 8 |
| Seguridad | Spring Security + JWT (jjwt) |
| Validación | Jakarta Bean Validation (`@Valid`) |
| Build | **Gradle** (Gradle Wrapper) |
| Pruebas | JUnit 5 + Mockito + AssertJ + MockMvc |
| Contenedores | Docker + Docker Compose |

---

## 🏗️ Arquitectura (por capas)

```
Controller  ->  Service  ->  Repository  ->  Base de datos
   (web)        (lógica)      (acceso datos)     (MySQL)
```

- **`controller`**: recibe las peticiones HTTP y devuelve JSON. No contiene lógica de negocio.
- **`service`**: la lógica del negocio (validaciones, transacciones, reglas).
- **`repository`**: interfaces de Spring Data JPA (consultas a la base de datos).
- **`model`**: entidades JPA que mapean las tablas.
- **`dto`**: objetos que entran/salen por la API (no se expone la entidad tal cual cuando no conviene).
- **`security`**: JWT, filtros y datos del usuario autenticado.
- **`handler`**: manejo global de errores (`GlobalExceptionHandler`).

---

## ▶️ Cómo ejecutar

### Opción A — Local (con MySQL propio)

1. Crea un archivo `.env` en la raíz (no se sube a Git). Puedes copiar la plantilla incluida:

   ```bash
   cp .env.example .env      # en Windows: copy .env.example .env
   ```

   Y ajusta los valores (base de datos, secreto JWT y cuenta admin):

   ```properties
   DB_URL=jdbc:mysql://localhost:3306/keso_pasteleria?createDatabaseIfNotExist=true
   DB_USERNAME=root
   DB_PASSWORD=tu_password
   JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
   ADMIN_EMAIL=admin@keso.com
   ADMIN_PASSWORD=tu_password_de_admin
   ```

2. Arranca la aplicación:

   ```bash
   ./gradlew bootRun
   ```

   En Windows: `gradlew.bat bootRun`

3. Abre **http://localhost:8080**

### Opción B — Docker (recomendada)

```bash
docker compose up --build
```

Levanta MySQL (`keso-db`) y la app (`keso-app`). Abre **http://localhost:8080**.

- Panel administrativo: `http://localhost:8080/panel-administrativo/login-admin.html`
- Credenciales por defecto: **admin@keso.com / admin1234** (cámbialas).

---

## ⚙️ Variables de entorno

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| `DB_URL` | URL JDBC de MySQL | `jdbc:mysql://localhost:3306/keso_pasteleria?...` |
| `DB_USERNAME` | Usuario de la base de datos | `root` |
| `DB_PASSWORD` | Contraseña de la base de datos | `root` |
| `JWT_SECRET` | Clave (Base64) para firmar los JWT | — (obligatoria) |
| `ADMIN_EMAIL` | Correo de la cuenta admin inicial | `admin@keso.com` |
| `ADMIN_PASSWORD` | Contraseña de la cuenta admin inicial | — |

---

## 🧪 Pruebas

```bash
./gradlew test
```

Incluye:
- **Unitarias** de `JwtService`, `AuthService` y `CheckoutService` (con Mockito).
- **De capa web** del `AuthController` (con MockMvc), incluyendo validación y errores.

---

## 🔌 Endpoints principales

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registro de cliente (devuelve JWT) |
| POST | `/auth/login` | Login de cliente (devuelve JWT) |
| POST | `/auth/admin/login` | Login de empleado/admin (cookie `AUTH_TOKEN`) |
| GET | `/auth/admin/me` | Datos del empleado autenticado |
| POST | `/auth/admin/logout` | Cierra la sesión del panel |

### Catálogo y ventas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/pasteles` | Lista de pasteles activos (catálogo) |
| GET | `/api/pasteles/{id}` | Detalle de un pastel |
| POST | `/api/pasteles/create-pastel` | Crear pastel (admin) |
| PUT | `/api/pasteles/{id}` | Editar pastel (admin) |
| DELETE | `/api/pasteles/{id}` | Baja lógica de pastel (admin) |
| GET | `/api/panes`, `/api/rellenos`, `/api/v1/cubiertas` | Catálogos de componentes |
| GET | `/api/ventas/{id}` | Detalle de una venta |

### Carrito y compra

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/checkout` | Registra la compra del cliente autenticado |
| GET | `/api/carritos/activo` | Carrito activo del cliente |

### Panel administrativo

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clientes` | Lista de clientes |
| GET | `/api/v1/empleados` | Lista de empleados |
| POST | `/api/v1/crear-empleado` | Crear empleado |
| PUT | `/api/v1/editar-empleado/{id}` | Editar empleado |
| DELETE | `/api/v1/eliminar-empleado/{id}` | Eliminar empleado |
| GET | `/api/dashboard/top-pastel-semana` | Pastel más vendido de la semana |
| GET | `/api/dashboard/ventas-anuales` | Ventas por mes |

---

## 📁 Estructura

```
keso-relleno/
├── src/main/java/com/keso/relleno/
│   ├── config/         # Seguridad, CORS, datos iniciales
│   ├── controller/     # Endpoints REST
│   ├── dto/            # Objetos de transferencia (con validaciones)
│   ├── handler/        # Manejo global de errores
│   ├── model/          # Entidades JPA
│   ├── repository/     # Acceso a datos
│   ├── security/       # JWT y autenticación
│   └── service/        # Lógica de negocio
├── src/main/resources/
│   ├── static/         # Front-end (HTML/CSS/JS)
│   └── application.properties
├── src/test/java/      # Pruebas
├── Dockerfile
└── docker-compose.yml
```

---

## 🔐 Notas de seguridad

- Las contraseñas se guardan **cifradas con BCrypt**.
- La autenticación usa **JWT**; el panel admin usa una cookie `HttpOnly`.
- Los secretos (`JWT_SECRET`, contraseñas) **no** deben subirse al repositorio: van en `.env` (ignorado por Git) o en variables de entorno.
