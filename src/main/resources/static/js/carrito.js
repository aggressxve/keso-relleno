let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");

const listaCarrito = document.getElementById("lista-carrito");
const carritoVacio = document.getElementById("carrito-vacio");
const resumenSubtotal = document.getElementById("resumen-subtotal");
const resumenTotal = document.getElementById("resumen-total");
const btnPagar = document.getElementById("btn-pagar");
const checkoutModal = document.getElementById("checkout-modal");
const checkoutForm = document.getElementById("checkout-form");
const ciudadCheckout = document.getElementById("checkout-ciudad");
const cpCheckout = document.getElementById("checkout-cp");

function formatearPrecio(numero) {
  return "$" + numero.toLocaleString("es-MX", { minimumFractionDigits: 2 });
}

function obtenerUsuarioSesion() {
  const usuarioJSON = localStorage.getItem("usuarioSesion");
  if (!usuarioJSON) return null;

  const usuario = JSON.parse(usuarioJSON);
  if (!usuario || typeof usuario !== "object" || !usuario.email) return null;
  return usuario;
}

function renderCarrito() {
  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    carritoVacio.classList.remove("d-none");
    btnPagar.disabled = true;
  } else {
    carritoVacio.classList.add("d-none");
    btnPagar.disabled = false;
  }

  carrito.forEach((producto) => {
    const subtotal = producto.precio * producto.cantidad;

    const item = document.createElement("div");
    item.className = "item-carrito d-flex align-items-center gap-3";

    item.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}" class="item-imagen">

      <div class="flex-grow-1">
        <h5 class="mb-1">${producto.nombre}</h5>
        <p class="mb-0 text-muted">${formatearPrecio(producto.precio)} c/u</p>
      </div>

      <div class="d-flex align-items-center gap-2 cantidad-control">
        <button class="btn-cantidad" data-accion="restar" data-id="${producto.id}">−</button>
        <span class="cantidad-valor">${producto.cantidad}</span>
        <button class="btn-cantidad" data-accion="sumar" data-id="${producto.id}">+</button>
      </div>

      <div class="text-end" style="min-width: 90px;">
        <p class="fw-bold mb-1">${formatearPrecio(subtotal)}</p>
        <button class="btn-eliminar" data-id="${producto.id}" aria-label="Eliminar producto">
          Eliminar
        </button>
      </div>
    `;

    listaCarrito.appendChild(item);
  });

  actualizarResumen();
}

function actualizarResumen() {
  const subtotal = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  resumenSubtotal.textContent = formatearPrecio(subtotal);
  resumenTotal.textContent = formatearPrecio(subtotal);
}

function cambiarCantidad(id, accion) {
  const producto = carrito.find((p) => p.id === id);
  if (!producto) return;

  if (accion === "sumar") {
    producto.cantidad++;
  } else if (accion === "restar") {
    producto.cantidad--;
    if (producto.cantidad <= 0) {
      carrito = carrito.filter((p) => p.id !== id);
    }
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));

  renderCarrito();
}

function eliminarProducto(id) {
  carrito = carrito.filter((p) => p.id !== id);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderCarrito();
}

function renderResumenCheckout() {
  const lista = document.getElementById("checkout-items");
  lista.replaceChildren();

  carrito.forEach((producto) => {
    const fila = document.createElement("div");
    fila.className = "checkout-item";

    const detalle = document.createElement("div");
    const nombre = document.createElement("strong");
    nombre.textContent = producto.nombre;
    const cantidad = document.createElement("span");
    cantidad.textContent = `${producto.cantidad} × ${formatearPrecio(producto.precio)}`;
    detalle.append(nombre, cantidad);

    const subtotal = document.createElement("strong");
    subtotal.textContent = formatearPrecio(producto.precio * producto.cantidad);
    fila.append(detalle, subtotal);
    lista.appendChild(fila);
  });

  const total = carrito.reduce((suma, producto) => suma + producto.precio * producto.cantidad, 0);
  document.getElementById("checkout-total").textContent = formatearPrecio(total);
}

function abrirCheckout() {
  if (carrito.length === 0) return;

  const usuario = obtenerUsuarioSesion();
  if (!usuario) {
    sessionStorage.setItem("checkoutPendiente", "true");
    window.location.href = "Login.html";
    return;
  }

  document.getElementById("checkout-nombre").textContent = usuario.nombre || "";
  document.getElementById("checkout-email").textContent = usuario.email || "";
  document.getElementById("checkout-telefono").textContent = usuario.telefono || "No registrado";
  renderResumenCheckout();
  document.getElementById("checkout-review").hidden = false;
  document.getElementById("checkout-confirmation").hidden = true;
  checkoutModal.hidden = false;
  document.body.classList.add("checkout-open");
  document.getElementById("checkout-close").focus();
}

function cerrarCheckout() {
  checkoutModal.hidden = true;
  document.body.classList.remove("checkout-open");
  btnPagar.focus();
}

// Delegación de eventos: un solo listener para todos los botones,
// aunque el contenido se regenere dinámicamente
listaCarrito.addEventListener("click", (e) => {   
  const botonCantidad = e.target.closest(".btn-cantidad");
  const botonEliminar = e.target.closest(".btn-eliminar");

  if (botonCantidad) {
    const id = Number(botonCantidad.dataset.id);
    const accion = botonCantidad.dataset.accion;
    cambiarCantidad(id, accion);
  }

  if (botonEliminar) {
    const id = Number(botonEliminar.dataset.id);
    eliminarProducto(id);
  }
});

btnPagar.addEventListener("click", abrirCheckout);

document.getElementById("checkout-close").addEventListener("click", cerrarCheckout);
document.getElementById("checkout-cancel").addEventListener("click", cerrarCheckout);
document.getElementById("checkout-finish").addEventListener("click", cerrarCheckout);

const fechaCheckout = document.getElementById("checkout-fecha");
const direccionCheckout = document.getElementById("checkout-direccion");
const domicilioCheckout = document.getElementById("checkout-domicilio");

const tiendaCheckout = document.getElementById("checkout-tienda");


//Sección de datos de tarjeta---------------------------------------------------------------------------

    // Pequeño script opcional para dar formato de diagonal (/) a la fecha de expiración automáticamente
    const expiryInput = document.getElementById('expiracion');
    expiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    // Pequeño script para agregar espacios automáticos cada 4 números en la tarjeta
    const cardNumberInput = document.getElementById('tarjeta');
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let matches = value.match(/\d{4,16}/g);
        let match = matches && matches[0] || '';
        let parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length > 0) {
            e.target.value = parts.join(' ');
        } else {
            e.target.value = value;
        }
    });
    
    //Mensaje de validación
    const form = document.getElementById('checkout-form');
    const mensaje = document.getElementById('mensaje-validacion');

    // Función para revisar la validez en tiempo real
    function validarFormulario() {
        // .checkValidity() revisa si TODOS los inputs con 'required', 'minlength', etc., están correctos
        if (form.checkValidity()) {
            mensaje.textContent = "✅ Todos los campos están llenos correctamente.";
            mensaje.style.color = "#28a745"; // Verde éxito
        } else {
            mensaje.textContent = "⚠️ Por favor, completa todos los campos correctamente.";
            mensaje.style.color = "#dc3545"; // Rojo error
        }
    }

    // Escuchar cuando el usuario escribe en cualquier parte del formulario
    form.addEventListener('input', validarFormulario);

    // Evitar el envío si hay errores al hacer clic en el botón
    //form.addEventListener('submit', (e) => {
        //if (!form.checkValidity()) {
            //e.preventDefault(); // Detiene el envío del formulario
            //validarFormulario();
        //} else {
            //alert("¡Formulario válido!");
        //}
    //});

// Dirección de la tienda: es el único lugar donde está escrita, y se usa en pantalla y en el mensaje final
const DIRECCION_TIENDA = "Hacienda Purísima, Haciendas de Tizayuca, 43815 Haciendas de Tizayuca, Hgo.";
document.getElementById("checkout-tienda-direccion").textContent = DIRECCION_TIENDA;

function actualizarTipoEntrega() {
  const tipoEntrega = checkoutForm.elements.namedItem("checkout-entrega").value;
  const esDomicilio = tipoEntrega === "domicilio";
  domicilioCheckout.hidden = !esDomicilio;
  tiendaCheckout.hidden = esDomicilio; // la dirección de la tienda solo se ve al recoger
  direccionCheckout.required = esDomicilio;
  ciudadCheckout.required = esDomicilio;
  cpCheckout.required = esDomicilio;
  document.getElementById("checkout-fecha-contexto").textContent =
    esDomicilio ? "de entrega" : "para recoger";
  document.getElementById("checkout-hora-contexto").textContent =
    esDomicilio ? "de entrega" : "para recoger";
}

const hoy = new Date();
const fechaLocal = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);
fechaCheckout.min = fechaLocal;

checkoutForm.querySelectorAll('input[name="checkout-entrega"]').forEach((opcion) => {
  opcion.addEventListener("change", actualizarTipoEntrega);
});
actualizarTipoEntrega();

checkoutModal.addEventListener("click", (event) => {
  if (event.target === checkoutModal) cerrarCheckout();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !checkoutModal.hidden) cerrarCheckout();
});

direccionCheckout.addEventListener("input", (event) => {
  event.target.setCustomValidity("");
});

cpCheckout.addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 5);
});

let enviandoCompra = false; // evita que un doble clic registre la compra dos veces

// Envía la compra al backend. Devuelve { ok: true } o { ok: false, error: "mensaje" }
async function enviarCompra(tipoEntrega, direccion, ciudad, codigoPostal) {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // El backend identifica al cliente con el token que guardó el login
        "Authorization": `Bearer ${localStorage.getItem("keso_token")}`
      },
      body: JSON.stringify({
        tipoEntrega,                                                    // "domicilio" o "tienda"
        direccion: tipoEntrega === "domicilio" ? direccion : null,
        ciudad: tipoEntrega === "domicilio" ? ciudad : null,
        codigoPostal: tipoEntrega === "domicilio" ? codigoPostal : null,
        fechaEntrega: fechaCheckout.value,                              // ej. "2026-10-20"
        horaEntrega: document.getElementById("checkout-hora").value,    // ej. "14:30"
        // Solo id y cantidad: el precio lo toma el servidor de la BD
        items: carrito.map(p => ({ pastelId: p.id, cantidad: p.cantidad }))
      })
    });
    if (res.ok) return { ok: true };
    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: "Tu sesión expiró. Inicia sesión de nuevo." };
    }
    const datos = await res.json().catch(() => ({}));
    return { ok: false, error: datos.error || "No se pudo registrar la compra. Intenta de nuevo." };
  } catch (e) {
    console.error("Error al enviar la compra:", e);
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
}

checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const tipoEntrega = checkoutForm.elements.namedItem("checkout-entrega").value;
  const direccion = direccionCheckout.value.trim();
  const ciudad = ciudadCheckout.value.trim();
  const codigoPostal = cpCheckout.value.trim();
  if (tipoEntrega === "domicilio" && !direccion) {
    direccionCheckout.setCustomValidity("Ingresa una dirección de entrega.");
    direccionCheckout.reportValidity();
    return;
  }

    // Manda la compra al backend; solo si se guarda bien se muestra la confirmación
    if (enviandoCompra) return;
    enviandoCompra = true;
    const respuesta = await enviarCompra(tipoEntrega, direccion, ciudad, codigoPostal);
    enviandoCompra = false;
    if (!respuesta.ok) {
      alert(respuesta.error);
      return;
    }
    // La compra ya está registrada: se vacía el carrito local
    localStorage.removeItem("carrito");
    carrito = [];
    renderCarrito();

  const usuario = obtenerUsuarioSesion();
  const fecha = new Date(`${fechaCheckout.value}T00:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const hora = document.getElementById("checkout-hora").value;
   const entrega = tipoEntrega === "domicilio"
     ? `Entrega a domicilio en ${direccion}, ${ciudad}, C.P. ${codigoPostal}, el ${fecha} a las ${hora}.`
     : `Recoger en tienda (${DIRECCION_TIENDA}) el ${fecha} a las ${hora}.`;

  document.getElementById("checkout-confirmation-message").textContent =
    `Gracias, ${usuario.nombre || "cliente"}. ${entrega} Pronto te informaremos sobre los siguientes pasos de tu compra en ${usuario.email}.`;
  document.getElementById("checkout-review").hidden = true;
  document.getElementById("checkout-confirmation").hidden = false;
  document.getElementById("checkout-finish").focus();
});

document.addEventListener("DOMContentLoaded", () => {
  renderCarrito();

  const parametros = new URLSearchParams(window.location.search);
  if (parametros.get("checkout") === "1") {
    sessionStorage.removeItem("checkoutPendiente");
    if (obtenerUsuarioSesion()) {
      abrirCheckout();
    } else {
      sessionStorage.setItem("checkoutPendiente", "true");
      window.location.href = "Login.html";
    }
    window.history.replaceState({}, "", window.location.pathname);
  }
});

