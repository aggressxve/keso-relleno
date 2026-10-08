document.addEventListener("DOMContentLoaded", () => {
    llamarNavbar();
    cargarFooter();

    // Bloquear fechas pasadas en el selector de fecha
    const inputFecha = document.getElementById("fecha");
    if (inputFecha) {
        const hoy = new Date().toISOString().split("T")[0];
        inputFecha.min = hoy;
    }

    // Envío del formulario
    const form = document.getElementById("form-pedido");
    const mensaje = document.getElementById("pedido-mensaje");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            form.querySelector(":invalid").focus();
            return;
        }

        const datos = Object.fromEntries(new FormData(form));
        datos.personas = Number(datos.personas);

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