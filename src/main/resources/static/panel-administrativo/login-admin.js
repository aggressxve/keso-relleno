const formLoginAdmin = document.getElementById("form-login-admin");
const mensajeLoginAdmin = document.getElementById("mensaje-login-admin");

function mostrarErrorLoginAdmin(mensaje) {
    mensajeLoginAdmin.textContent = mensaje;
    mensajeLoginAdmin.hidden = false;
}

formLoginAdmin.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensajeLoginAdmin.hidden = true;

    const correo = document.getElementById("admin-usuario").value.trim();
    const contrasena = document.getElementById("admin-contrasena").value;
    const boton = formLoginAdmin.querySelector('button[type="submit"]');
    boton.disabled = true;

    try {
        const response = await fetch("/auth/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo, contrasena })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "No se pudo iniciar sesión.");
        }

        sessionStorage.setItem("empleadoActual", JSON.stringify(data));
        window.location.replace("/panel-administrativo/vistaGeneral.html");
    } catch (error) {
        mostrarErrorLoginAdmin(
            error instanceof TypeError
                ? "No se pudo conectar con el servidor. Intenta de nuevo."
                : error.message
        );
    } finally {
        boton.disabled = false;
    }
});

if (new URLSearchParams(window.location.search).get("error") === "conexion") {
    mostrarErrorLoginAdmin("No se pudo validar tu sesión. Inicia sesión nuevamente.");
}

fetch("/auth/admin/me", { credentials: "same-origin" })
    .then((response) => {
        if (response.ok) {
            window.location.replace("/panel-administrativo/vistaGeneral.html");
        }
    })
    .catch(() => mostrarErrorLoginAdmin("No se pudo validar la sesión con el servidor."));
