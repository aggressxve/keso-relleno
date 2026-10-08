document.addEventListener("DOMContentLoaded", () => {
    llamarNavbar();
    cargarFooter();

    // Bloquear fechas pasadas en el selector de fecha
    const inputFecha = document.getElementById("fecha");
    if (inputFecha) {
        const hoy = new Date().toISOString().split("T")[0];
        inputFecha.min = hoy;
    }

    // Validación del correo
    const correo = document.getElementById("correo");
    const correoError = document.getElementById("correo-error");

    function validarCorreo() {
        const valor = correo.value.trim();
        let error = "";

        if (valor === "") {
            error = "Escribe tu correo electrónico.";
        } else if (!valor.includes("@")) {
            error = "Agregar el @.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
            error = "El correo no es válido. Ejemplo: correo@ejemplo.com";
        }

        correo.setCustomValidity(error);
        correoError.textContent = error;
    }

    correo.addEventListener("input", validarCorreo);
    validarCorreo();

    // Envío del formulario
    const form = document.getElementById("form-pedido");
    const mensaje = document.getElementById("pedido-mensaje");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });

            if (!respuesta.ok) throw new Error("Error " + respuesta.status);

            mostrarMensaje("¡Pedido enviado! Te contactaremos pronto 🎂", "ok");
            form.reset();
            form.classList.remove("was-validated");
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