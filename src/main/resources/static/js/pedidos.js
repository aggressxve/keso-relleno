// Página de pedidos del panel. menú lateral hay un enlace llamado "Pedidos",
// se usa ese automáticamente; esto es solo el respaldo.
const PAGINA_PEDIDOS = "pedidos.html";

// Qué estados cuentan en cada tarjeta
const ESTADOS_PENDIENTES = ["Pendiente"];          // ej: ["Pendiente", "En preparación"]
const ESTADOS_ENTREGADOS = ["Entregado"];

const CLASES_ESTADO = {
    "Pendiente": "estado-pendiente",
    "Entregado": "estado-entregado",
    "En reparto": "estado-en-reparto",
    "En preparación": "estado-en-preparacion"
};

/* ---------- Elementos y estado ---------- */

const modal = document.getElementById("modal-editar");
const botonCerrar = document.getElementById("cerrarModal");
const listaPedidos = document.getElementById("lista-pedidos");
const listaCorta = document.getElementById("lista-corta");

let botonOrigen = null;
let ventaActual = null;
let todasLasVentas = [];
let filtroActual = new URLSearchParams(window.location.search).get("filtro") || "";


/* =====================================================
   UTILIDADES
===================================================== */

function escaparHTML(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function claseDeEstado(estado) {
    return CLASES_ESTADO[estado] ?? "";
}

// Fecha de hoy como AAAA-MM-DD en hora LOCAL (new Date("2026-10-14") la corre un día)
function fechaHoyISO() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function esDeHoy(venta) {
    return String(venta.fecha ?? "").slice(0, 10) === fechaHoyISO();
}

function esPendiente(venta) {
    return ESTADOS_PENDIENTES.includes(venta.estado);
}

function esEntregado(venta) {
    return ESTADOS_ENTREGADOS.includes(venta.estado);
}

function filtrarVentas(ventas, filtro) {
    switch (filtro) {
        case "hoy":        return ventas.filter(esDeHoy);
        case "pendientes": return ventas.filter(esPendiente);
        case "entregados": return ventas.filter(esEntregado);
        default:           return ventas;
    }
}

// Enlace a la página de pedidos (toma el del menú lateral si existe)
function urlPedidos() {
    const enlaceMenu = Array.from(document.querySelectorAll(".sidebar-nav a"))
        .find((a) => a.textContent.trim().toLowerCase() === "pedidos");
    return enlaceMenu?.getAttribute("href") || PAGINA_PEDIDOS;
}


/* =====================================================
   CONTADORES (hoy / pendientes / entregados)
===================================================== */

function pintarContadores(conteo) {
    const destinos = [
        { valor: conteo.hoy,        selectores: [".hoyPedidos .stat-number",  ".cantidad-pedidosH"] },
        { valor: conteo.pendientes, selectores: [".pendPedidos .stat-number", ".cantidad-pedidosP"] },
        { valor: conteo.entregados, selectores: [".entrPedidos .stat-number", ".cantidad-pedidosE"] }
    ];

    destinos.forEach(({ valor, selectores }) => {
        document.querySelectorAll(selectores.join(",")).forEach((el) => {
            el.textContent = valor;
        });
    });
}

function actualizarContadores() {
    pintarContadores({
        hoy: todasLasVentas.filter(esDeHoy).length,
        pendientes: todasLasVentas.filter(esPendiente).length,
        entregados: todasLasVentas.filter(esEntregado).length
    });
}

// Las flechitas de Inicio mandan a Pedidos ya filtrado
function actualizarEnlacesFlechas() {
    const base = urlPedidos();
    const enlaces = [
        [".hoyPedidos .stat-arrow",  "hoy"],
        [".pendPedidos .stat-arrow", "pendientes"],
        [".entrPedidos .stat-arrow", "entregados"]
    ];

    enlaces.forEach(([selector, filtro]) => {
        const flecha = document.querySelector(selector);
        if (flecha) {
            flecha.href = `${base}?filtro=${filtro}`;
        }
    });
}

function mostrarDetallesPedido(venta) {
    const ticket = document.querySelector(".ticket-contenido");

    if (!ticket || !venta) return;

    // Datos del cliente
    const nombreCliente = venta.cliente?.nombre ?? "Sin cliente";
    const correo = venta.cliente?.correo ?? "Sin correo";
    const telefono = venta.cliente?.telefono ?? "Sin teléfono";

    // Datos del pastel
    const nombrePastel = venta.pastel?.nombre ?? "Sin pastel";
    const imagenPastel = venta.pastel?.urlFoto ?? "";
    const cantidad = venta.cantidad ?? 1;

    const precioUnitario = venta.pastel?.precio != null
        ? Number(venta.pastel.precio)
        : null;

    // Datos de entrega
    const tipoEntrega = venta.tipoEntrega ?? "Sin especificar";
    const fecha = venta.fechaEntrega ?? "Sin fecha";

    const hora = venta.horaEntrega
        ? venta.horaEntrega.slice(0, 5)
        : "Sin hora";

    const direccion = venta.direccion?.lugarEntrega ?? "Sin dirección";

    const esEntregaADomicilio =
        tipoEntrega.toLowerCase().includes("domicilio");

    // Datos del pedido
    const estado = venta.estado ?? "Sin estado";

    const subtotal = venta.subtotal != null
        ? Number(venta.subtotal)
        : null;

    const numeroPedido =
        `PED-${String(venta.idVenta).padStart(3, "0")}`;

    // Formato de moneda
    const formatoMoneda = (cantidad) =>
        cantidad.toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN"
        });

    ticket.innerHTML = `
        <div class="detalles-pedido">

            <!-- Cliente -->
            <section class="detalle-cliente">

                <div class="cliente-avatar">
                    <img
                        src="${escaparHTML(imagenPastel)}"
                        alt="${escaparHTML(nombrePastel)}"
                        onerror="this.style.display='none'"
                    >
                </div>

                <div class="cliente-informacion">
                    <strong class="cliente-nombre">
                        ${escaparHTML(nombreCliente)}
                    </strong>

                    <span>${escaparHTML(correo)}</span>
                    <span>${escaparHTML(telefono)}</span>

                    ${esEntregaADomicilio ? `
                        <span>
                            ${escaparHTML(direccion)}
                        </span>
                    ` : ""}
                </div>

            </section>

            <hr>

            <!-- Artículos -->
            <section class="detalle-articulos">

                <h4>Artículos</h4>

                <div class="articulo-pedido">

                    <div class="articulo-imagen">
                        <img
                            src="${escaparHTML(imagenPastel)}"
                            alt="${escaparHTML(nombrePastel)}"
                            onerror="this.style.display='none'"
                        >
                    </div>

                    <div class="articulo-informacion">

                        <strong>
                            ${escaparHTML(nombrePastel)}
                        </strong>

                        <div class="articulo-precio-fila">
                            <span>
                                Cantidad: ${cantidad}
                            </span>

                            <span>
                                ${precioUnitario !== null
                                    ? formatoMoneda(precioUnitario)
                                    : "Precio no disponible"}
                            </span>
                        </div>

                    </div>

                </div>

            </section>

            <hr>

            <!-- Información de entrega -->
            <section class="detalle-entrega">

                <h4>Entrega</h4>

                <div class="entrega-datos">
                    <span>
                        <strong>Tipo:</strong>
                        ${escaparHTML(tipoEntrega)}
                    </span>

                    <span>
                        <strong>Fecha:</strong>
                        ${escaparHTML(fecha)}
                    </span>

                    <span>
                        <strong>Hora:</strong>
                        ${escaparHTML(hora)}
                    </span>
                </div>

            </section>

            <hr>

            <!-- Resumen -->
            <section class="detalle-resumen">

                <div class="resumen-pedido">
                    <span>
                        <strong>Pedido:</strong>
                        ${numeroPedido}
                    </span>

                    <span>
                        <strong>Estado:</strong>
                        ${escaparHTML(estado)}
                    </span>
                </div>

                <div class="detalle-total">
                    <strong>Total:</strong>

                    <strong>
                        ${subtotal !== null
                            ? formatoMoneda(subtotal)
                            : "No disponible"}
                    </strong>
                </div>

            </section>

            <!-- Botones -->
            <div class="acciones-detalle-pedido">

                <button
                    type="button"
                    class="btn-imprimir-pedido"
                >
                    Imprimir pedido
                </button>

                <button
                    type="button"
                    class="btn-actualizar-pedido"
                >
                    Actualizar pedido
                </button>

            </div>

        </div>
    `;
}

/* =====================================================
   TABLA COMPLETA (página Pedidos)
===================================================== */

function crearFilaPedido(venta, index) {
    const fila = document.createElement("div");

    fila.classList.add("row", "pedido", index === 0 ? "pedido-first" : "pedido-rest");
    fila.dataset.idVenta = venta.idVenta;

    fila.style.cursor = "pointer";

    fila.addEventListener("click", (evento) => {
        // No seleccionar el pedido al interactuar con el menú de acciones.
        if (evento.target.closest(".acciones-pedido")) {
            return;
        }

        // Resaltar la fila seleccionada.
        listaPedidos.querySelectorAll(".pedido").forEach((otraFila) => {
            otraFila.classList.remove("pedido-seleccionado");
        });

        fila.classList.add("pedido-seleccionado");

        // Mostrar los detalles del pedido seleccionado.
        mostrarDetallesPedido(venta);
    });

    fila.innerHTML = `
        <div class="col sc">
            PED-${String(venta.idVenta).padStart(3, "0")}
        </div>

        <div class="col sc">
            ${escaparHTML(venta.cliente?.nombre ?? "Sin cliente")}
        </div>

        <div class="col sc">
            ${escaparHTML(venta.fechaEntrega ?? "Sin fecha")}
        </div>

        <div class="col sc">
            ${escaparHTML(venta.horaEntrega ?? "Sin hora")}
        </div>

        <div class="col sc">
            <div class="row justify-content-md-center">
                <div class="col-auto estado ${claseDeEstado(venta.estado)}">
                    ${escaparHTML(venta.estado ?? "Sin estado")}
                </div>
            </div>
        </div>

        <div class="col acciones-pedido">
            <button
                type="button"
                class="btn-menu-acciones"
                aria-label="Acciones del pedido PED-${String(venta.idVenta).padStart(3, "0")}"
                aria-haspopup="true"
                aria-expanded="false"
                title="Más opciones"
            >
                ⋮
            </button>

            <div class="menu-acciones" hidden>
                <button
                    type="button"
                    class="accion-modificar"
                >
                    <span aria-hidden="true">✏️</span>
                    Modificar
                </button>

                <button
                    type="button"
                    class="accion-eliminar"
                >
                    <span aria-hidden="true">🗑️</span>
                    Eliminar
                </button>
            </div>
        </div>
    `;

    const botonMenu = fila.querySelector(".btn-menu-acciones");
    const menu = fila.querySelector(".menu-acciones");
    const botonModificar = fila.querySelector(".accion-modificar");
    const botonEliminar = fila.querySelector(".accion-eliminar");

    botonMenu.addEventListener("click", (evento) => {
        evento.stopPropagation();

        const estabaAbierto = !menu.hidden;

        // Cerrar los demás menús antes de abrir este.
        document.querySelectorAll(".menu-acciones").forEach((otroMenu) => {
            otroMenu.hidden = true;

            const otroBoton = otroMenu
                .closest(".acciones-pedido")
                ?.querySelector(".btn-menu-acciones");

            if (otroBoton) {
                otroBoton.setAttribute("aria-expanded", "false");
            }

            otroMenu.closest(".pedido")?.classList.remove("acciones-abiertas");
        });

        if (!estabaAbierto) {
            menu.hidden = false;
            botonMenu.setAttribute("aria-expanded", "true");
            fila.classList.add("acciones-abiertas");
        }
    });

    document.addEventListener("click", (evento) => {
    if (evento.target.closest(".acciones-pedido")) {
        return;
    }

    document.querySelectorAll(".menu-acciones").forEach((menu) => {
        menu.hidden = true;

        const boton = menu
            .closest(".acciones-pedido")
            ?.querySelector(".btn-menu-acciones");

        if (boton) {
            boton.setAttribute("aria-expanded", "false");
        }

        menu.closest(".pedido")?.classList.remove("acciones-abiertas");
    });
});

    // Modificar: reutilizar el modal que ya funciona.
    botonModificar.addEventListener("click", () => {
        menu.hidden = true;
        botonMenu.setAttribute("aria-expanded", "false");
        fila.classList.remove("acciones-abiertas");

        botonOrigen = botonModificar;
        abrirModal(venta, botonModificar);
    });

    // Eliminar: llamar a la función que implementaremos en el siguiente paso.
    botonEliminar.addEventListener("click", async () => {
        menu.hidden = true;
        botonMenu.setAttribute("aria-expanded", "false");
        fila.classList.remove("acciones-abiertas");

        await eliminarVenta(venta);
    });

    return fila;
}

function renderPedidos() {
    if (!listaPedidos) return;

    const ventas = filtrarVentas(todasLasVentas, filtroActual);

    listaPedidos.innerHTML = "";

    if (ventas.length === 0) {
        listaPedidos.innerHTML = `<p class="mt-3 mb-0" style="color:#8a7a80;">No hay pedidos para mostrar.</p>`;
        return;
    }

    ventas.forEach((venta, index) => {
        listaPedidos.appendChild(crearFilaPedido(venta, index));
    });
}

// Tarjetas de la página Pedidos: al hacer clic filtran (y otro clic quita el filtro)
function marcarTarjetaActiva() {
    [
        [".pedidosH", "hoy"],
        [".pedidosP", "pendientes"],
        [".pedidosE", "entregados"]
    ].forEach(([selector, filtro]) => {
        const tarjeta = document.querySelector(selector);
        if (tarjeta) {
            tarjeta.style.outline = filtroActual === filtro ? "3px solid #F077A3" : "";
        }
    });
}

function iniciarFiltroPorTarjetas() {
    if (!listaPedidos) return;

    [
        [".pedidosH", "hoy"],
        [".pedidosP", "pendientes"],
        [".pedidosE", "entregados"]
    ].forEach(([selector, filtro]) => {
        const tarjeta = document.querySelector(selector);
        if (!tarjeta) return;

        tarjeta.style.cursor = "pointer";
        tarjeta.addEventListener("click", () => {
            filtroActual = filtroActual === filtro ? "" : filtro;

            const url = new URL(window.location.href);
            if (filtroActual) {
                url.searchParams.set("filtro", filtroActual);
            } else {
                url.searchParams.delete("filtro");
            }
            window.history.replaceState({}, "", url);

            renderPedidos();
            marcarTarjetaActiva();
        });
    });
}


/* =====================================================
   PEDIDOS RECIENTES (página Inicio)
===================================================== */

function renderPedidosRecientes() {
    if (!listaCorta) return;

    // data-limite="3" en el HTML = cuántos mostrar
    const limite = parseInt(listaCorta.dataset.limite, 10);

    // Los más recientes primero (id más alto = pedido más nuevo)
    const recientes = [...todasLasVentas].sort((a, b) => b.idVenta - a.idVenta);
    const aMostrar = Number.isNaN(limite) ? recientes : recientes.slice(0, limite);

    listaCorta.innerHTML = "";

    aMostrar.forEach((venta, index) => {
        const fila = document.createElement("div");

        fila.classList.add("row", "pedido", index === 0 ? "pedido-first" : "pedido-rest");

        fila.innerHTML = `
            <div class="col prim">PED-${String(venta.idVenta).padStart(3, "0")}</div>
            <div class="col sc">${escaparHTML(venta.cliente?.nombre ?? "Sin cliente")}</div>
            <div class="col sc">${escaparHTML(venta.fechaEntrega ?? "Sin fecha")}</div>
            <div class="col sc">${escaparHTML(venta.horaEntrega ?? "Sin hora")}</div>
            <div class="col sc">
                <div class="row justify-content-md-center">
                    <div class="col-auto estado ${claseDeEstado(venta.estado)}">
                        ${escaparHTML(venta.estado ?? "Sin estado")}
                    </div>
                </div>
            </div>
            <div class="col">
                <a href="${urlPedidos()}" class="vermas">Ver más</a>
            </div>
        `;

        listaCorta.appendChild(fila);
    });
}


//funcion eliminar pedido
function eliminarVenta(venta) {
    const modalEliminar = document.getElementById("modal-eliminar");
    const inputConfirmacion = document.getElementById("confirmacion-eliminar");
    const botonConfirmar = document.getElementById("confirmar-eliminacion");
    const botonCancelar = document.getElementById("cancelar-eliminacion");
    const mensajeEliminar = document.getElementById("mensaje-eliminar");
    const errorConfirmacion = document.getElementById("error-confirmacion-eliminar");

    const numeroPedido = `PED-${String(venta.idVenta).padStart(3, "0")}`;

    mensajeEliminar.textContent =
        `¿Estás seguro de que deseas eliminar el pedido ${numeroPedido}?`;

    inputConfirmacion.value = "";
    botonConfirmar.disabled = true;
    errorConfirmacion.textContent = "";

    modalEliminar.hidden = false;
    inputConfirmacion.focus();

    function cerrarModal() {
        modalEliminar.hidden = true;

        inputConfirmacion.removeEventListener("input", validarTexto);
        botonConfirmar.removeEventListener("click", confirmar);
        botonCancelar.removeEventListener("click", cancelar);
        modalEliminar.removeEventListener("click", cerrarAlHacerClicFuera);
        document.removeEventListener("keydown", manejarEscape);
    }

    function validarTexto() {
        const esValido = inputConfirmacion.value.trim() === "eliminar";

        botonConfirmar.disabled = !esValido;
        errorConfirmacion.textContent = esValido
            ? ""
            : "Debes escribir exactamente eliminar en minúsculas.";
    }

    function cancelar() {
        cerrarModal();
    }

    function cerrarAlHacerClicFuera(evento) {
        if (evento.target === modalEliminar) {
            cancelar();
        }
    }

    function manejarEscape(evento) {
        if (evento.key === "Escape") {
            cancelar();
        }
    }

    async function confirmar() {
        if (inputConfirmacion.value.trim() !== "eliminar") {
            validarTexto();
            return;
        }

        botonConfirmar.disabled = true;
        botonCancelar.disabled = true;
        inputConfirmacion.disabled = true;

        botonConfirmar.textContent = "Eliminando...";

        try {
            const respuesta = await window.fetchConAuth(
                `/api/ventas/${venta.idVenta}`,
                {
                    method: "DELETE",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (!respuesta.ok) {
                if (respuesta.status === 404) {
                    throw new Error("El pedido ya no existe.");
                }

                if (respuesta.status === 403) {
                    throw new Error("No tienes permisos para eliminar este pedido.");
                }

                throw new Error(`Error HTTP ${respuesta.status}`);
            }

            cerrarModal();

            todasLasVentas = todasLasVentas.filter(
                v => v.idVenta !== venta.idVenta
            );

            refrescarVista();

            window.alert(`El pedido ${numeroPedido} se eliminó correctamente.`);

        } catch (error) {
            console.error("Error al eliminar la venta:", error);

            botonConfirmar.textContent = "Eliminar pedido";
            botonCancelar.disabled = false;
            inputConfirmacion.disabled = false;
            botonConfirmar.disabled = inputConfirmacion.value.trim() !== "eliminar";

            errorConfirmacion.textContent =
                error.message || "No se pudo eliminar el pedido.";
        }
    }

    inputConfirmacion.addEventListener("input", validarTexto);
    botonConfirmar.addEventListener("click", confirmar);
    botonCancelar.addEventListener("click", cancelar);
    modalEliminar.addEventListener("click", cerrarAlHacerClicFuera);
    document.addEventListener("keydown", manejarEscape);
}

/* =====================================================
   CARGA DE DATOS
===================================================== */

function refrescarVista() {
    renderPedidos();
    renderPedidosRecientes();
    actualizarContadores();
    actualizarEnlacesFlechas();
    marcarTarjetaActiva();
}

async function cargarVentas() {
    try {
        const response = await window.fetchConAuth("/api/ventas", {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Error HTTP: " + response.status);
        }

        todasLasVentas = await response.json();
        console.log("Ventas recibidas:", todasLasVentas);

        refrescarVista();
    } catch (error) {
        console.error("No se pudieron cargar los pedidos:", error);
        // Mejor un guion que un número falso
        pintarContadores({ hoy: "–", pendientes: "–", entregados: "–" });
    }
}

iniciarFiltroPorTarjetas();
cargarVentas();


/* =====================================================
   MODAL DE EDICIÓN  (solo existe en la página Pedidos)
===================================================== */

function abrirModal(venta, boton) {
    ventaActual = venta;

    document.getElementById("modal-pedido").textContent =
        `PED-${String(venta.idVenta).padStart(3, "0")}`;

    document.getElementById("modal-cliente").textContent =
        venta.cliente?.nombre ?? "Sin cliente";

    document.getElementById("modal-pastel").textContent =
        venta.pastel?.nombre ?? "Sin pastel";

    document.getElementById("modal-subtotal").textContent =
        venta.subtotal != null
            ? `$${Number(venta.subtotal).toFixed(2)}`
            : "Sin subtotal";

    document.getElementById("modal-fecha").textContent =
        venta.fechaEntrega ?? "Sin fecha";

    document.getElementById("modal-hora").textContent =
        venta.horaEntrega ?? "Sin hora";

    document.getElementById("modal-tipo-entrega").textContent =
        venta.tipoEntrega ?? "Sin tipo de entrega";

    document.getElementById("modal-direccion").textContent =
        venta.direccion?.lugarEntrega ?? "Sin dirección";

    document.getElementById("modal-estado").textContent =
        venta.estado ?? "Sin estado";

    document.getElementById("modal-empleado").textContent =
        venta.empleado ?? "Sin empleado";

    const rect = boton.getBoundingClientRect();
    const centroX = rect.left + rect.width / 2;
    const centroY = rect.top + rect.height / 2;
    const origenX = centroX - window.innerWidth / 2;
    const origenY = centroY - window.innerHeight / 2;

    modal.style.setProperty("--origen-x", `${origenX}px`);
    modal.style.setProperty("--origen-y", `${origenY}px`);

    modal.classList.remove("animando-salida");
    modal.classList.remove("animando-entrada");

    modal.hidden = false;

    void modal.offsetWidth;
    modal.classList.add("animando-entrada");
}

function cerrarModal() {

    if (modal.hidden) {
        return;
    }

    modal.classList.remove("animando-entrada");
    modal.classList.add("animando-salida");
    modal.addEventListener("animationend", function finalizarCierre(evento) {

        if (
            evento.target !== modal ||
            evento.animationName !== "fondo-salida"
        ) {
            return;
        }

        modal.hidden = true;
        modal.classList.remove("animando-salida");
        modal.removeEventListener("animationend", finalizarCierre);
    });
}

// Todo lo de abajo solo se activa si la página tiene el modal (o sea, en Pedidos)
if (modal && botonCerrar) {

    botonCerrar.addEventListener("click", cerrarModal);
    modal.addEventListener("click", (evento) => {

        if (evento.target === modal) {
            cerrarModal();
        }
    });

    const selectorCampo = document.getElementById("campo");
    const contenedorCampo = document.getElementById("contenedor-campo");
    const etiquetaCampo = document.getElementById("etiqueta-campo");
    const inputCampo = document.getElementById("campo-seleccionado");

    const botonGuardar = document.getElementById("guardar-cambios");
    const mensajeEdicion = document.getElementById("mensaje-edicion");

    const contenedorFecha = document.getElementById("contenedor-fecha");
    const selectorDia = document.getElementById("fecha-dia");
    const selectorMes = document.getElementById("fecha-mes");
    const selectorAnio = document.getElementById("fecha-anio");

    const meses = [
        "Ene", "Feb", "Mar", "Abr",
        "May", "Jun", "Jul", "Ago",
        "Sep", "Oct", "Nov", "Dic"
    ];

    // Cargar los meses.
    meses.forEach((mes, indice) => {
        const opcion = document.createElement("option");

        opcion.value = String(indice + 1).padStart(2, "0");
        opcion.textContent = mes;

        selectorMes.appendChild(opcion);
    });

    // Crear las opciones de año.
    function cargarAnios(anioSeleccionado) {

        selectorAnio.innerHTML = "";

        const anioActual = new Date().getFullYear();

        const inicio = Math.min(anioActual, anioSeleccionado);
        const fin = Math.max(anioActual + 10, anioSeleccionado);

        for (let anio = inicio; anio <= fin; anio++) {
            const opcion = document.createElement("option");

            opcion.value = anio;
            opcion.textContent = anio;

            selectorAnio.appendChild(opcion);
        }

        selectorAnio.value = anioSeleccionado;
    }

    // Ajustar los días disponibles según mes y año.
    function actualizarDias(diaSeleccionado = null) {

        const mes = Number(selectorMes.value);
        const anio = Number(selectorAnio.value);

        const diasDelMes = new Date(anio, mes, 0).getDate();

        const diaAnterior = Number(
            diaSeleccionado ?? selectorDia.value ?? 1
        );

        selectorDia.innerHTML = "";

        for (let dia = 1; dia <= diasDelMes; dia++) {
            const opcion = document.createElement("option");

            opcion.value = String(dia).padStart(2, "0");
            opcion.textContent = String(dia).padStart(2, "0");

            selectorDia.appendChild(opcion);
        }

        selectorDia.value = String(
            Math.min(diaAnterior, diasDelMes)
        ).padStart(2, "0");
    }

    // Cargar una fecha ISO: AAAA-MM-DD.
    function cargarFecha(fechaISO) {

        const partes = fechaISO.split("-");

        const anio = Number(partes[0]);
        const mes = partes[1];
        const dia = partes[2];

        cargarAnios(anio);

        selectorMes.value = mes;

        actualizarDias(Number(dia));

        selectorDia.value = dia;
    }

    // Actualizar días cuando cambie el mes o el año.
    selectorMes.addEventListener("change", () => {
        actualizarDias();
    });

    selectorAnio.addEventListener("change", () => {
        actualizarDias();
    });

    selectorCampo.addEventListener("change", () => {
        contenedorFecha.hidden = true;

        const campoSeleccionado = selectorCampo.value;

        inputCampo.value = "";
        inputCampo.min = "";
        inputCampo.max = "";
        inputCampo.step = "";
        inputCampo.placeholder = "";

        const selectoresHora = contenedorCampo.querySelector(".selectores-hora");

        if (selectoresHora) {
            selectoresHora.remove();
        }

        if (!campoSeleccionado) {
            contenedorCampo.hidden = true;
            return;
        }

        switch (campoSeleccionado) {

            case "cliente":
                etiquetaCampo.textContent = "Nombre del cliente";
                inputCampo.type = "text";
                break;

            case "pastel":
                etiquetaCampo.textContent = "Pastel";
                inputCampo.type = "text";
                break;

            case "fechaEntrega":
                etiquetaCampo.textContent = "Nueva fecha de entrega";
                inputCampo.hidden = true;
                contenedorFecha.hidden = false;
                if (ventaActual?.fechaEntrega) {
                    cargarFecha(ventaActual.fechaEntrega);
                }
                break;

            case "horaEntrega": {

                etiquetaCampo.textContent = "Nueva hora de entrega";

                inputCampo.hidden = true;

                const grupo = document.createElement("div");
                grupo.className = "selectores-hora";

                function crearSelector(id, etiqueta, opciones) {

                    const grupoCampo = document.createElement("div");

                    const label = document.createElement("label");
                    label.htmlFor = id;
                    label.textContent = etiqueta;

                    const select = document.createElement("select");
                    select.id = id;

                    opciones.forEach(opcion => {

                        const option = document.createElement("option");

                        option.value = opcion.valor;
                        option.textContent = opcion.texto;

                        select.appendChild(option);

                    });

                    grupoCampo.appendChild(label);
                    grupoCampo.appendChild(select);
                    grupo.appendChild(grupoCampo);

                    return select;
                }

                const opcionesHoras = Array.from(
                    { length: 12 },
                    (_, i) => {

                        const numero = String(i + 1).padStart(2, "0");

                        return {
                            valor: numero,
                            texto: numero
                        };
                    }
                );

                const opcionesMinutos = Array.from(
                    { length: 60 },
                    (_, i) => {

                        const numero = String(i).padStart(2, "0");

                        return {
                            valor: numero,
                            texto: numero
                        };
                    }
                );

                const opcionesPeriodo = [
                    { valor: "AM", texto: "AM" },
                    { valor: "PM", texto: "PM" }
                ];

                const selectorHora = crearSelector(
                    "hora-12",
                    "Hora",
                    opcionesHoras
                );

                const selectorMinutos = crearSelector(
                    "minutos",
                    "Minutos",
                    opcionesMinutos
                );

                const selectorPeriodo = crearSelector(
                    "periodo",
                    "Periodo",
                    opcionesPeriodo
                );

                const horaGuardada = ventaActual?.horaEntrega;

                if (horaGuardada) {

                    const [horas, minutos] = horaGuardada.split(":");

                    const hora24 = Number(horas);

                    const hora12 = String(
                        hora24 % 12 || 12
                    ).padStart(2, "0");

                    selectorHora.value = hora12;
                    selectorMinutos.value = minutos;
                    selectorPeriodo.value = hora24 >= 12 ? "PM" : "AM";
                }

                contenedorCampo.appendChild(grupo);

                break;
            }

            case "tipoEntrega":
                etiquetaCampo.textContent = "Tipo de entrega";
                inputCampo.type = "text";
                break;

            case "direccion":
                etiquetaCampo.textContent = "Nueva dirección";
                inputCampo.type = "text";
                break;

            case "estado":
                etiquetaCampo.textContent = "Nuevo estado";
                inputCampo.type = "text";
                break;

            case "telefono":
                etiquetaCampo.textContent = "Nuevo teléfono";
                inputCampo.type = "tel";
                break;

            case "subtotal":
                etiquetaCampo.textContent = "Nuevo subtotal";
                inputCampo.type = "number";
                inputCampo.min = "0";
                inputCampo.step = "0.01";
                break;
        }

        if (campoSeleccionado !== "horaEntrega" && campoSeleccionado !== "fechaEntrega") {
            inputCampo.hidden = false;
        }

        contenedorCampo.hidden = false;
    });

    // Elementos del modal de confirmación de cambios.
    const modalConfirmarCambios = document.getElementById(
        "modal-confirmar-cambios"
    );

    const mensajeConfirmarCambios = document.getElementById(
        "mensaje-confirmar-cambios"
    );

    const botonCancelarConfirmarCambios = document.getElementById(
        "cancelar-confirmar-cambios"
    );

    const botonAceptarConfirmarCambios = document.getElementById(
        "aceptar-confirmar-cambios"
    );

    let datosPendientesDeGuardar = null;
    let guardandoCambios = false;

    // 1. Validar los datos y abrir el modal de confirmación.
    botonGuardar.addEventListener("click", () => {
        if (!ventaActual) {
            mensajeEdicion.textContent = "No hay un pedido seleccionado.";
            return;
        }

        const campo = selectorCampo.value;

        if (!campo) {
            mensajeEdicion.textContent =
                "Selecciona un campo para modificar.";
            return;
        }

        let valor;

        switch (campo) {
            case "fechaEntrega":
                valor = `${selectorAnio.value}-${selectorMes.value}-${selectorDia.value}`;
                break;

            case "horaEntrega": {
                const selectorHora = document.getElementById("hora-12");
                const selectorMinutos = document.getElementById("minutos");
                const selectorPeriodo = document.getElementById("periodo");

                if (!selectorHora || !selectorMinutos || !selectorPeriodo) {
                    mensajeEdicion.textContent =
                        "No se encontraron los selectores de hora.";
                    return;
                }

                let hora = Number(selectorHora.value);

                if (selectorPeriodo.value === "PM" && hora !== 12) {
                    hora += 12;
                } else if (
                    selectorPeriodo.value === "AM" &&
                    hora === 12
                ) {
                    hora = 0;
                }

                valor = `${String(hora).padStart(2, "0")}:${selectorMinutos.value}:00`;
                break;
            }

            case "tipoEntrega":
            case "estado":
                valor = inputCampo.value.trim();

                if (!valor) {
                    mensajeEdicion.textContent =
                        "Escribe un valor antes de guardar.";
                    return;
                }

                break;

            default:
                mensajeEdicion.textContent =
                    "Este campo no se puede modificar desde aquí.";
                return;
        }

        datosPendientesDeGuardar = {
            idVenta: ventaActual.idVenta,
            datos: {
                [campo]: valor
            }
        };

        mensajeConfirmarCambios.textContent =
            `¿Estás seguro de que deseas guardar los cambios del pedido PED-${String(ventaActual.idVenta).padStart(3, "0")}?`;

        modalConfirmarCambios.hidden = false;
    });

    // 2. Cancelar la confirmación y regresar a la edición.
    botonCancelarConfirmarCambios.addEventListener("click", () => {
        if (guardandoCambios) return;

        modalConfirmarCambios.hidden = true;
        datosPendientesDeGuardar = null;
    });

    // Cerrar al hacer clic fuera del cuadro.
    modalConfirmarCambios.addEventListener("click", (evento) => {
        if (
            evento.target === modalConfirmarCambios &&
            !guardandoCambios
        ) {
            modalConfirmarCambios.hidden = true;
            datosPendientesDeGuardar = null;
        }
    });

    // 3. Confirmar y enviar los cambios al backend.
    botonAceptarConfirmarCambios.addEventListener("click", async () => {
        if (!datosPendientesDeGuardar || guardandoCambios) {
            return;
        }

        guardandoCambios = true;

        botonAceptarConfirmarCambios.disabled = true;
        botonCancelarConfirmarCambios.disabled = true;
        botonAceptarConfirmarCambios.textContent = "Guardando...";

        const { idVenta, datos } = datosPendientesDeGuardar;

        try {
            const respuesta = await window.fetchConAuth(
                `/api/ventas/${idVenta}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(datos)
                }
            );

            if (!respuesta.ok) {
                const detalle = await respuesta.text();
                throw new Error(detalle || `Error HTTP ${respuesta.status}`);
            }

            const ventaActualizada = await respuesta.json();

            const posicion = todasLasVentas.findIndex(
                venta => venta.idVenta === idVenta
            );

            if (posicion !== -1) {
                Object.assign(todasLasVentas[posicion], ventaActualizada);
                ventaActual = todasLasVentas[posicion];
            } else {
                ventaActual = { ...ventaActual, ...ventaActualizada };
            }

            document.getElementById("modal-fecha").textContent =
                ventaActual.fechaEntrega ?? "Sin fecha";

            document.getElementById("modal-hora").textContent =
                ventaActual.horaEntrega ?? "Sin hora";

            document.getElementById("modal-tipo-entrega").textContent =
                ventaActual.tipoEntrega ?? "Sin tipo de entrega";

            document.getElementById("modal-estado").textContent =
                ventaActual.estado ?? "Sin estado";

            document.getElementById("modal-empleado").textContent =
                ventaActual.empleado ?? "Sin empleado";

            refrescarVista();

            modalConfirmarCambios.hidden = true;
            datosPendientesDeGuardar = null;

            mensajeEdicion.textContent =
                "¡Cambios guardados correctamente!";

        } catch (error) {
            console.error("Error al actualizar el pedido:", error);

            modalConfirmarCambios.hidden = true;

            mensajeEdicion.textContent =
                "No se pudieron guardar los cambios. " + error.message;

        } finally {
            guardandoCambios = false;

            botonAceptarConfirmarCambios.disabled = false;
            botonCancelarConfirmarCambios.disabled = false;
            botonAceptarConfirmarCambios.textContent = "Confirmar cambios";
        }
    });
}