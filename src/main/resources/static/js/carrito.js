let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");

const listaCarrito = document.getElementById("lista-carrito");
const carritoVacio = document.getElementById("carrito-vacio");
const resumenSubtotal = document.getElementById("resumen-subtotal");
const resumenTotal = document.getElementById("resumen-total");
const btnPagar = document.getElementById("btn-pagar");
const checkoutModal = document.getElementById("checkout-modal");
const checkoutForm = document.getElementById("checkout-form");

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

function actualizarTipoEntrega() {
  const tipoEntrega = checkoutForm.elements.namedItem("checkout-entrega").value;
  const esDomicilio = tipoEntrega === "domicilio";
  domicilioCheckout.hidden = !esDomicilio;
  direccionCheckout.required = esDomicilio;
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

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const tipoEntrega = checkoutForm.elements.namedItem("checkout-entrega").value;
  const direccion = direccionCheckout.value.trim();
  if (tipoEntrega === "domicilio" && !direccion) {
    direccionCheckout.setCustomValidity("Ingresa una dirección de entrega.");
    direccionCheckout.reportValidity();
    return;
  }

  const usuario = obtenerUsuarioSesion();
  const fecha = new Date(`${fechaCheckout.value}T00:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  const hora = document.getElementById("checkout-hora").value;
  const entrega = tipoEntrega === "domicilio"
    ? `Entrega a domicilio en ${direccion}, el ${fecha} a las ${hora}.`
    : `Recoger en tienda el ${fecha} a las ${hora}.`;

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
