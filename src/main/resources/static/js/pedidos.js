const modal = document.getElementById("modal-editar");
const botonCerrar = document.getElementById("cerrarModal");
let botonOrigen = null;
let ventaActual = null;

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
        const respuesta = await fetch(
            `http://localhost:8080/api/ventas/${ventaActual.idVenta}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
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

        // Actualizar la venta seleccionada con la respuesta del backend.
        ventaActual = ventaActualizada;

        // Actualizar los datos actuales del modal.
        document.getElementById("modal-fecha").textContent =
            ventaActualizada.fechaEntrega ?? "Sin fecha";

        document.getElementById("modal-hora").textContent =
            ventaActualizada.horaEntrega ?? "Sin hora";

        document.getElementById("modal-tipo-entrega").textContent =
            ventaActualizada.tipoEntrega ?? "Sin tipo de entrega";

        document.getElementById("modal-estado").textContent =
            ventaActualizada.estado ?? "Sin estado";
    
        document.getElementById("modal-empleado").textContent =
            ventaActualizada.estado ?? "Sin empleado";
    

        // Actualizar la fila del pedido en la tabla.
        const fila = listaPedidos?.querySelector(
            `[data-id-venta="${ventaActualizada.idVenta}"]`
        );

        if (fila) {
            const columnas = fila.querySelectorAll(".col");

            // Columnas: ID, cliente, fecha, hora, estado, botón.
            if (columnas[2]) {
                columnas[2].textContent =
                    ventaActualizada.fechaEntrega ?? "Sin fecha";
            }

            if (columnas[3]) {
                columnas[3].textContent =
                    ventaActualizada.horaEntrega ?? "Sin hora";
            }

            const estadoCol = fila.querySelector(".estado");

            if (estadoCol) {
                estadoCol.textContent =
                    ventaActualizada.estado ?? "Sin estado";

                estadoCol.classList.remove(
                    "estado-pendiente",
                    "estado-entregado",
                    "estado-en-reparto",
                    "estado-en-preparacion"
                );

                switch (ventaActualizada.estado) {
                    case "Pendiente":
                        estadoCol.classList.add("estado-pendiente");
                        break;

                    case "Entregado":
                        estadoCol.classList.add("estado-entregado");
                        break;

                    case "En reparto":
                        estadoCol.classList.add("estado-en-reparto");
                        break;

                    case "En preparación":
                        estadoCol.classList.add("estado-en-preparacion");
                        break;
                }
            }
        }

        mensajeEdicion.textContent = "¡Cambios guardados correctamente!";

    } catch (error) {
        console.error("Error al actualizar el pedido:", error);

        mensajeEdicion.textContent =
            "No se pudieron guardar los cambios. " + error.message;

    } finally {
        botonGuardar.disabled = false;
    }
});

const listaPedidos = document.getElementById("lista-pedidos");

if (!listaPedidos) {
    console.error("No se encontró el elemento con id 'lista-pedidos'");
} else {

    const token = localStorage.getItem("token");

    if (!token) {
        console.error("No hay sesión iniciada. No se encontró el token.");
    } else {

        fetch("http://localhost:8080/api/ventas", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error HTTP: " + response.status);
            }

            return response.json();
        })
        .then(ventas => {

            console.log("Ventas recibidas:", ventas);

            ventas.forEach((venta, index) => {

                const fila = document.createElement("div");

                fila.classList.add("row", "pedido");
                fila.dataset.idVenta = venta.idVenta;

                if (index === 0) {
                    fila.classList.add("pedido-first");
                } else {
                    fila.classList.add("pedido-rest");
                }

                fila.innerHTML = `
                    <div class="col sc">
                        PED-${String(venta.idVenta).padStart(3, "0")}
                    </div>

                    <div class="col sc">
                        ${venta.cliente?.nombre ?? "Sin cliente"}
                    </div>

                    <div class="col sc">
                        ${venta.fechaEntrega ?? "Sin fecha"}
                    </div>

                    <div class="col sc">
                        ${venta.horaEntrega ?? "Sin hora"}
                    </div>

                    <div class="col sc">
                        <div class="row justify-content-md-center">
                            <div class="col-auto estado">
                                ${venta.estado ?? "Sin estado"}
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <button type="button" class="editar">Editar</button>
                    </div>
                `;

                const botonEditar = fila.querySelector(".editar");

                botonEditar.addEventListener("click", () => {
                    botonOrigen = botonEditar
                    abrirModal(venta, botonEditar);
                });

                const estadoCol = fila.querySelector(".estado");

                if (venta.estado === "Pendiente") {
                    estadoCol.classList.add("estado-pendiente");

                } else if (venta.estado === "Entregado") {
                    estadoCol.classList.add("estado-entregado");

                } else if (venta.estado === "En reparto") {
                    estadoCol.classList.add("estado-en-reparto");

                } else if (venta.estado === "En preparación") {
                    estadoCol.classList.add("estado-en-preparacion");
                }

                listaPedidos.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("No se pudieron cargar los pedidos:", error);
        });
    }
}



const listaCorta = document.getElementById("lista-corta")

if (!listaCorta) {
  console.error("No se encontró el elemento con id 'lista-corta'")
} else {

  // Lee el atributo data-limite del HTML.
  // Si existe (ej. data-limite="3"), corta el array con slice().
  // Si no existe (undefined), usa el array completo de pedidos.
  const limite = listaCorta.dataset.limite
  const pedidosAMostrar = limite ? pedidos.slice(0, parseInt(limite)) : pedidos

  pedidosAMostrar.forEach((pedido, index) => {
    const fila = document.createElement("div")
    fila.classList.add("row", "pedido")

    if (index === 0) {
      fila.classList.add("pedido-first")
    } else {
      fila.classList.add("pedido-rest")
    }

    fila.innerHTML = `
      <div class="col prim">${pedido.id}</div>
      <div class="col sc">${pedido.cliente}</div>
      <div class="col sc">${pedido.fecha}</div>
      <div class="col sc">${pedido.entrega}</div>
      <div class="col sc">
        <div class="row justify-content-md-center">
          <div class="col-auto estado">${pedido.estado}</div>
        </div>
      </div>
      <div class="col">
        <a href="./" class="vermas">Ver más</a>
      </div>
    `

    const estadoCol = fila.querySelector(".estado")
    if (pedido.estado === "Pendiente") {
        estadoCol.classList.add("estado-pendiente")
    }else if (pedido.estado === "Entregado") {
        estadoCol.classList.add("estado-entregado")
    }else if (pedido.estado === "En reparto") {
        estadoCol.classList.add("estado-en-reparto")
    }else if (pedido.estado === "En preparación") {
        estadoCol.classList.add("estado-en-preparacion")
    }

    listaCorta.appendChild(fila)
  })
}