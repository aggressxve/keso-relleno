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
    return String(venta.fechaEntrega ?? "").slice(0, 10) === fechaHoyISO();
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


/* =====================================================
   TABLA COMPLETA (página Pedidos)
===================================================== */

function crearFilaPedido(venta, index) {
    const fila = document.createElement("div");

    fila.classList.add("row", "pedido", index === 0 ? "pedido-first" : "pedido-rest");
    fila.dataset.idVenta = venta.idVenta;

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

        <div class="col">
            <button type="button" class="editar">Editar</button>
        </div>
    `;

    const botonEditar = fila.querySelector(".editar");

    botonEditar.addEventListener("click", () => {
        botonOrigen = botonEditar;
        abrirModal(venta, botonEditar);
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

    document.getElementById("modal-telefono").textContent =
        venta.cliente?.telefono ?? "Sin telefono";

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

    botonGuardar.addEventListener("click", async () => {
        if (!ventaActual) {
            mensajeEdicion.textContent = "No hay un pedido seleccionado.";
            return;
        }

        const campo = selectorCampo.value;

        if (!campo) {
            mensajeEdicion.textContent = "Selecciona un campo para modificar.";
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            mensajeEdicion.textContent = "Tu sesión no está disponible. Inicia sesión nuevamente.";
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
                    mensajeEdicion.textContent = "No se encontraron los selectores de hora.";
                    return;
                }

                let hora = Number(selectorHora.value);

                if (selectorPeriodo.value === "PM" && hora !== 12) {
                    hora += 12;
                } else if (selectorPeriodo.value === "AM" && hora === 12) {
                    hora = 0;
                }

                valor = `${String(hora).padStart(2, "0")}:${selectorMinutos.value}:00`;
                break;
            }

            case "tipoEntrega":
            case "estado":
                valor = inputCampo.value.trim();

                if (!valor) {
                    mensajeEdicion.textContent = "Escribe un valor antes de guardar.";
                    return;
                }
                break;

            default:
                mensajeEdicion.textContent = "Este campo no se puede modificar desde aquí.";
                return;
        }

        const datosActualizacion = {
            [campo]: valor
        };

        botonGuardar.disabled = true;
        mensajeEdicion.textContent = "Guardando cambios...";

        try {
            const respuesta = await window.fetchConAuth(
                `/api/ventas/${ventaActual.idVenta}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(datosActualizacion)
                }
            );

            if (!respuesta.ok) {
                const detalle = await respuesta.text();

                throw new Error(
                    detalle || `Error HTTP ${respuesta.status}`
                );
            }

            const ventaActualizada = await respuesta.json();

            // Se mezcla con la venta que ya teníamos, para no perder campos
            // (cliente, pastel, etc.) si la respuesta del backend viene incompleta.
            const posicion = todasLasVentas.findIndex(
                (v) => v.idVenta === ventaActual.idVenta
            );

            if (posicion !== -1) {
                Object.assign(todasLasVentas[posicion], ventaActualizada);
                ventaActual = todasLasVentas[posicion];
            } else {
                ventaActual = { ...ventaActual, ...ventaActualizada };
            }

            // Actualizar los datos actuales del modal.
            document.getElementById("modal-fecha").textContent =
                ventaActual.fechaEntrega ?? "Sin fecha";

            document.getElementById("modal-hora").textContent =
                ventaActual.horaEntrega ?? "Sin hora";

            document.getElementById("modal-tipo-entrega").textContent =
                ventaActual.tipoEntrega ?? "Sin tipo de entrega";

            document.getElementById("modal-estado").textContent =
                ventaActual.estado ?? "Sin estado";

            // (Antes aquí se escribía el ESTADO en el campo de empleado; ya está corregido)
            document.getElementById("modal-empleado").textContent =
                ventaActual.empleado ?? "Sin empleado";

            // Vuelve a dibujar la tabla y recalcula los contadores
            // (si cambiaste el estado, los números de las tarjetas se actualizan solos)
            refrescarVista();

            mensajeEdicion.textContent = "¡Cambios guardados correctamente!";

        } catch (error) {
            console.error("Error al actualizar el pedido:", error);

            mensajeEdicion.textContent =
                "No se pudieron guardar los cambios. " + error.message;

        } finally {
            botonGuardar.disabled = false;
        }
    });
}