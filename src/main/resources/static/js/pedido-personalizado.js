document.addEventListener("DOMContentLoaded", () => {
    llamarNavbar();
    cargarFooter();

    // Modal que bloquea el acceso si no hay sesión
    const modalLogin = new bootstrap.Modal(document.getElementById("modalLogin"));
    if (!tokenVigente()) {
        cerrarSesion(); // limpia un token vencido, si lo había
        modalLogin.show();
    }

    // Bloquear fechas pasadas en el selector de fecha
    const inputFecha = document.getElementById("fecha");
    if (inputFecha) {
        const hoy = new Date().toISOString().split("T")[0];
        inputFecha.min = hoy;
    }

    const form = document.getElementById("form-pedido");

        // Pre-rellena el formulario con los datos de la cuenta
        function prellenarDatos() {
            if (!tokenVigente()) return;

            let usuario = null;
            try {
                usuario = JSON.parse(localStorage.getItem("usuarioSesion"));
            } catch (e) {
                return;
            }
            if (!usuario) return;

            // El nombre queda fijo porque está ligado a la cuenta
            const campoNombre = document.getElementById("nombre");
            campoNombre.value = usuario.nombre || "";
            campoNombre.readOnly = true;

            // Correo y teléfono se pre-llenan, pero se pueden editar
            document.getElementById("correo").value = usuario.email || "";
            document.getElementById("telefono").value = usuario.telefono || "";
        }

        prellenarDatos();

    const mensaje = document.getElementById("pedido-mensaje");

    // --- Datos de entrega a domicilio ---
    const bloqueDomicilio = document.getElementById("pedido-domicilio");
    const selectEntrega = document.getElementById("entrega");

    // Muestra los campos de dirección solo si eligió "A domicilio".
    // Los ocultos se deshabilitan para que no se validen ni se envíen.
    function actualizarEntrega() {
        const esDomicilio = selectEntrega.value === "domicilio";
        bloqueDomicilio.hidden = !esDomicilio;
        bloqueDomicilio.querySelectorAll("input, textarea").forEach(el => el.disabled = !esDomicilio);
    }
    selectEntrega.addEventListener("change", actualizarEntrega);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Por si la sesión venció mientras llenaba el formulario
        if (!tokenVigente()) {
            cerrarSesion();
            modalLogin.show();
            return;
        }

        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            // Solo controles, no fieldsets
            form.querySelector("input:invalid, select:invalid, textarea:invalid").focus();
            return;
        }

        const datos = Object.fromEntries(new FormData(form));
        datos.personas = Number(datos.personas);

        // Si eligió "No aplica", lo mandamos como null
        ["bizcocho", "relleno", "cobertura"].forEach((campo) => {
            if (datos[campo] === "no-aplica") datos[campo] = null;
        });

        console.log("Pedido a enviar:", datos);

        try {
            const respuesta = await fetch("http://localhost:8080/api/pedidos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + obtenerToken()
                },
                body: JSON.stringify(datos)
            });

            // El back rechazó el token: pedir login otra vez
            if (respuesta.status === 401 || respuesta.status === 403) {
                cerrarSesion();
                modalLogin.show();
                return;
            }

            // Error de validación del servidor (ej. código postal inválido): se muestra su mensaje
            if (respuesta.status === 400) {
                const err = await respuesta.json().catch(() => ({}));
                mostrarMensaje(err.error || "Revisa los datos del pedido.", "error");
                return;
            }

            if (!respuesta.ok) throw new Error("Error " + respuesta.status);

            mostrarMensaje("¡Pedido enviado! Te contactaremos pronto 🎂", "ok");
            form.reset();
            actualizarEntrega(); // vuelve a ocultar los campos de dirección
            form.classList.remove("was-validated");
            prellenarDatos();
        } catch (error) {
            console.error(error);
            mostrarMensaje("No pudimos enviar tu pedido. Intenta de nuevo.", "error");
        }
    });

    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = "pedido-mensaje pedido-mensaje--" + tipo;
        mensaje.scrollIntoView({ behavior: "smooth", block: "center" });
    }
});