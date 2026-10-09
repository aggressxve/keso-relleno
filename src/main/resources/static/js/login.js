const API_URL = "http://localhost:8080";

const formulario = document.getElementById("registroForm");

const btnLogin = document.getElementById("btnLogin");
const btnRegistrarse = document.getElementById("btnRegistrarse");

const camposRegistro = document.getElementById("camposRegistro");
const campoConfirmarPassword = document.getElementById("campoConfirmarPassword");

const tituloFormulario = document.getElementById("tituloFormulario");
const subtituloFormulario = document.getElementById("subtituloFormulario");
const vistaFormulario = document.getElementById("login-form-view");
const vistaPerfil = document.getElementById("perfil-sesion");
const checkoutPendiente = () => sessionStorage.getItem("checkoutPendiente") === "true";

let modoLogin = false;


// ---------- Funciones para hablar con el back ----------

function mostrarAlertaServidor(texto) {
    const alerta = document.getElementById("alertServidor");
    alerta.textContent = texto;
    alerta.classList.remove("d-none");
}

function ocultarAlertaServidor() {
    document.getElementById("alertServidor").classList.add("d-none");
}

// A dónde ir después de entrar: carrito pendiente > ?redirect= > inicio
function destinoDespuesDeLogin() {
    if (checkoutPendiente()) {
        sessionStorage.removeItem("checkoutPendiente");
        return "Carrito.html?checkout=1";
    }
    const redirect = new URLSearchParams(window.location.search).get("redirect") || "";
    return /^[\w-]+\.html$/.test(redirect) ? redirect : "index.html";
}

async function registrarEnBack(datos) {
    const alertExito = document.getElementById("alertExito");
    try {
        const respuesta = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        const data = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            alertExito.classList.add("d-none");
            mostrarAlertaServidor(data.mensaje || "No se pudo crear la cuenta.");
            return;
        }

        guardarSesion(data.token, {
            idCliente: data.idCliente,
            nombre: data.nombre,
            telefono: data.telefono,
            email: data.correo
        });
        alertExito.classList.remove("d-none");
        formulario.reset();
        setTimeout(() => { window.location.href = destinoDespuesDeLogin(); }, 1500);
    } catch (error) {
        console.error(error);
        mostrarAlertaServidor("No pudimos conectar con el servidor. Intenta de nuevo.");
    }
}

async function iniciarSesion() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const alertLoginCampos = document.getElementById("alertLoginCampos");
    const alertLoginCredenciales = document.getElementById("alertLoginCredenciales");
    const alertLoginSinUsuario = document.getElementById("alertLoginSinUsuario");
    const alertLoginExito = document.getElementById("alertLoginExito");

    alertLoginCampos.classList.add("d-none");
    alertLoginCredenciales.classList.add("d-none");
    alertLoginSinUsuario.classList.add("d-none");
    alertLoginExito.classList.add("d-none");
    ocultarAlertaServidor();

    // Validar campos vacíos
    if (email === "" || password === "") {
        alertLoginCampos.classList.remove("d-none");
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo: email, contrasena: password })
        });
        const data = await respuesta.json().catch(() => ({}));

        if (respuesta.status === 401) {
            alertLoginCredenciales.classList.remove("d-none");
            return;
        }
        if (!respuesta.ok) {
            mostrarAlertaServidor(data.mensaje || "Ocurrió un error en el servidor.");
            return;
        }

        guardarSesion(data.token, {
            idCliente: data.idCliente,
            nombre: data.nombre,
            telefono: data.telefono,
            email: data.correo
        });
        alertLoginExito.classList.remove("d-none");

        setTimeout(function () {
            formulario.reset();
            alertLoginExito.classList.add("d-none");
            window.location.href = destinoDespuesDeLogin();
        }, 1500);
    } catch (error) {
        console.error(error);
        mostrarAlertaServidor("No pudimos conectar con el servidor. Intenta de nuevo.");
    }
}


// ---------- Código original ----------

function mostrarPerfil(usuario) {
    document.getElementById("perfil-nombre").textContent = usuario.nombre || "cliente";
    document.getElementById("perfil-nombre-completo").textContent = usuario.nombre || "";
    document.getElementById("perfil-email").textContent = usuario.email || "";
    document.getElementById("perfil-telefono").textContent = usuario.telefono || "No registrado";
    vistaFormulario.hidden = true;
    vistaPerfil.hidden = false;
}

// Espera el evento submit del formulario
formulario.addEventListener("submit", function (event) {

    event.preventDefault();

    if (modoLogin) {
        iniciarSesion();
        return;
    }

    // Obtener los valores de los campos
    const nombre = document.getElementById("nombreCompleto").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmarPassword = document.getElementById("confirmPassword").value;

    let hayErrores = false;


    // Validación del nombre completo
    const alertNombre = document.getElementById("alertNombre");
    const campoNombre = document.getElementById("nombreCompleto");
    const patronNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (
        nombre === "" ||
        nombre.length < 3 ||
        !patronNombre.test(nombre)
    ) {
        alertNombre.classList.remove("d-none");
        campoNombre.classList.add("is-invalid");
        hayErrores = true;
    } else {
        alertNombre.classList.add("d-none");
        campoNombre.classList.remove("is-invalid");
    }


    // Validación del teléfono
    const alertTelefono = document.getElementById("alertTelefono");
    const campoTelefono = document.getElementById("telefono");
    const patronTelefono = /^[0-9]{10}$/;

    if (
        telefono === "" ||
        !patronTelefono.test(telefono)
    ) {
        alertTelefono.classList.remove("d-none");
        campoTelefono.classList.add("is-invalid");
        hayErrores = true;
    } else {
        alertTelefono.classList.add("d-none");
        campoTelefono.classList.remove("is-invalid");
    }


    // Validación del correo electrónico
    const alertEmail = document.getElementById("alertEmail");
    const campoEmail = document.getElementById("email");
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        email === "" ||
        !patronEmail.test(email)
    ) {
        alertEmail.classList.remove("d-none");
        campoEmail.classList.add("is-invalid");
        hayErrores = true;
    } else {
        alertEmail.classList.add("d-none");
        campoEmail.classList.remove("is-invalid");
    }


    // Validación de la contraseña
    const alertPassword = document.getElementById("alertPassword");
    const campoPassword = document.getElementById("password");
    const patronPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9]{8,20}$/; // 8-20 caracteres, al menos una mayúscula, una minúscula y un número (sin espacios)

    if (
        password === "" ||
        !patronPassword.test(password)
    ) {
        alertPassword.classList.remove("d-none");
        campoPassword.classList.add("is-invalid");
        hayErrores = true;
    } else {
        alertPassword.classList.add("d-none");
        campoPassword.classList.remove("is-invalid");
    }


    // Confirmación de la contraseña
    const alertCoincidencia =
        document.getElementById("alertCoincidencia");
    const campoConfirmarPassword =
        document.getElementById("confirmPassword");

    if (
        confirmarPassword === "" ||
        password !== confirmarPassword
    ) {
        alertCoincidencia.classList.remove("d-none");
        campoConfirmarPassword.classList.add("is-invalid");
        hayErrores = true;
    } else {
        alertCoincidencia.classList.add("d-none");
        campoConfirmarPassword.classList.remove("is-invalid");
    }


    // Alerta general de errores
    const alertCampos = document.getElementById("alertCampos");

    const todosVacios =
        nombre === "" &&
        telefono === "" &&
        email === "" &&
        password === "" &&
        confirmarPassword === "";

    if (todosVacios) {
        alertNombre.classList.add("d-none");
        alertTelefono.classList.add("d-none");
        alertEmail.classList.add("d-none");
        alertPassword.classList.add("d-none");
        alertCoincidencia.classList.add("d-none");

        alertCampos.classList.remove("d-none");
    } else if (hayErrores) {
        alertCampos.classList.remove("d-none");
    } else {
        alertCampos.classList.add("d-none");
    }


    // El registro va al back
    const alertExito = document.getElementById("alertExito");
    ocultarAlertaServidor();

    if (!hayErrores) {
        registrarEnBack({ nombre, telefono, correo: email, contrasena: password });
    } else {
        alertExito.classList.add("d-none");
    }

});


// Ojito para ver contraseña

function habilitarToggle(inputId, iconoId) {
    const input = document.getElementById(inputId);
    const icono = document.getElementById(iconoId);

    function toggle() {
        const esPassword = input.type === 'password';
        input.type = esPassword ? 'text' : 'password';
        icono.textContent = esPassword ? 'visibility' : 'visibility_off';
        icono.setAttribute('aria-label', esPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
    }

    icono.addEventListener('click', toggle);
    icono.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
        }
    });
}

habilitarToggle('password', 'iconPassword');
habilitarToggle('confirmPassword', 'iconConfirmPassword');

// Botón Iniciar sesión / Crear cuenta
const textoToggleAuth = document.getElementById("textoToggleAuth");

btnLogin.addEventListener("click", function (event) {
    event.preventDefault();

    modoLogin = !modoLogin;

    // Limpiar todas las alertas
    document.getElementById("alertExito").classList.add("d-none");
    document.getElementById("alertCampos").classList.add("d-none");
    document.getElementById("alertNombre").classList.add("d-none");
    document.getElementById("alertTelefono").classList.add("d-none");
    document.getElementById("alertEmail").classList.add("d-none");
    document.getElementById("alertPassword").classList.add("d-none");
    document.getElementById("alertCoincidencia").classList.add("d-none");
    document.getElementById("alertLoginCampos").classList.add("d-none");
    document.getElementById("alertLoginCredenciales").classList.add("d-none");
    document.getElementById("alertLoginSinUsuario").classList.add("d-none");
    document.getElementById("alertLoginExito").classList.add("d-none");
    ocultarAlertaServidor();

    formulario.reset();

    if (modoLogin) {
        camposRegistro.classList.add("d-none");
        campoConfirmarPassword.classList.add("d-none");
        document.getElementById("passwordHelpBlock").classList.add("d-none");

        tituloFormulario.textContent = "¡Bienvenido de nuevo!";
        subtituloFormulario.textContent = checkoutPendiente()
            ? "Inicia sesión para regresar al carrito y continuar tu compra."
            : "Inicia sesión para continuar.";

        btnRegistrarse.textContent = "Iniciar sesión";

        textoToggleAuth.textContent = "¿Aún no tienes una cuenta?";
        btnLogin.textContent = "Créala aquí";

    } else {
        camposRegistro.classList.remove("d-none");
        campoConfirmarPassword.classList.remove("d-none");
        document.getElementById("passwordHelpBlock").classList.remove("d-none");

        tituloFormulario.textContent = "¡Crea tu cuenta!";
        subtituloFormulario.textContent = checkoutPendiente()
            ? "Crea tu cuenta o inicia sesión; volverás al carrito para continuar tu compra."
            : "Regístrate para diseñar un pastel único para cada ocasión.";

        btnRegistrarse.textContent = "Registrarse";

        textoToggleAuth.textContent = "¿Ya tienes una cuenta?";
        btnLogin.textContent = "Inicia sesión aquí";
    }
});

document.getElementById("btn-ir-carrito").addEventListener("click", () => {
    const destino = checkoutPendiente() ? "Carrito.html?checkout=1" : "Carrito.html";
    sessionStorage.removeItem("checkoutPendiente");
    window.location.href = destino;
});

// cerrarSesion() borra también el token
document.getElementById("btn-cerrar-sesion").addEventListener("click", () => {
    cerrarSesion();
    sessionStorage.removeItem("checkoutPendiente");
    window.location.reload();
});

// La sesión solo cuenta si el token sigue vigente
const sesionJSON = localStorage.getItem("usuarioSesion");
if (sesionJSON && tokenVigente()) {
    mostrarPerfil(JSON.parse(sesionJSON));
} else {
    // Sesión vieja o token vencido: se limpia
    cerrarSesion();
    if (checkoutPendiente()) {
        subtituloFormulario.textContent = "Inicia sesión o crea tu cuenta; regresarás al carrito para continuar tu compra.";
    }
}

// Limpiar formulario al regresar a la página
window.addEventListener("pageshow", function () {

    formulario.reset();

    document.getElementById("alertLoginCampos").classList.add("d-none");
    document.getElementById("alertLoginCredenciales").classList.add("d-none");
    document.getElementById("alertLoginSinUsuario").classList.add("d-none");
    document.getElementById("alertLoginExito").classList.add("d-none");
    ocultarAlertaServidor();

});