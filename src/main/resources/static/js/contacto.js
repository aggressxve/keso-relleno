(function () {
  const form = document.getElementById("form-contacto");
  const aviso = document.getElementById("contacto-mensaje");
  if (!form || !aviso) return;

  let temporizador;

  function mostrar(tipo, texto) {
    clearTimeout(temporizador);
    aviso.className = "contacto-mensaje contacto-mensaje--" + tipo;
    aviso.textContent = texto;
    aviso.scrollIntoView({ behavior: "smooth", block: "nearest" });
    temporizador = setTimeout(() => {
      aviso.className = "contacto-mensaje";
      aviso.textContent = "";
    }, 8000);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const datos = {
      nombre: form.name.value.trim(),
      apellido: form.surname.value.trim(),
      correo: form.email.value.trim(),
      mensaje: form.message.value.trim()
    };

    const boton = form.querySelector(".btn-submit");
    boton.disabled = true;

    try {
      // TODO: aquí va el envío al backend cuando exista el endpoint.
      // await fetch("/api/contacto", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(datos)
      // });

      mostrar("ok", "¡Gracias, " + datos.nombre + "! Recibimos tu mensaje y te responderemos pronto.");
      form.reset();
    } catch (err) {
      mostrar("error", "No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos.");
    } finally {
      boton.disabled = false;
    }
  });
})();