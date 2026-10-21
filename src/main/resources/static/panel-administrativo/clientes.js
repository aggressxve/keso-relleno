/* =====================================================
   PÁGINA CLIENTES - carga, búsqueda, filtro, orden y eliminar
   Los datos vienen de la API de Spring Boot (base de datos).
   Para ver el diseño sin backend abre:  clientes.html?demo=1
===================================================== */
(() => {
    // ---------- Configuración ----------
    const API_URL = "/api/v1";
    const DIRECCION_TIENDA = "Hacienda Purísima, Haciendas de Tizayuca, 43815 Haciendas de Tizayuca, Hgo.";
    const MODO_DEMO = new URLSearchParams(window.location.search).has("demo");

    // Si tu API pide token JWT, se envía desde aquí.
    // Cambia "token" por el nombre con el que lo guarda tu login-admin.
    function cabeceras() {
    return {
        "Content-Type": "application/json"
    };
}

    // Adapta ESTA función a los nombres de campos que devuelve tu API (Java).
    // Cada cliente se convierte en el mismo formato que usa la tabla.
        function normalizar(c) {
            const dirs = c.direcciones || [];

            // Obtener la dirección a domicilio más reciente,
            // ignorando la dirección de la tienda.
            const d = [...dirs].reverse()
                .find((x) =>
                    x.lugarEntrega &&
                    x.lugarEntrega !== DIRECCION_TIENDA
                ) || {};

            return {
                id: c.idCliente ?? c.id ?? "",
                idDireccion: d.idDireccion ?? d.id ?? null,
                nombre: [c.nombre, c.apellidos ?? c.apellido]
                    .filter(Boolean)
                    .join(" "),
                direccion: d.lugarEntrega ?? "",
                cp: d.codigoPostal ?? "",
                ciudad: d.ciudad ?? "",
                telefono: c.telefono ?? "",
                correo: c.correo ?? c.email ?? ""
            };
        }

    const DEMO = [
        { id: 1, nombre: "María González", calle: "Av. Insurgentes", numero: "123", colonia: "Del Valle", cp: "03100", ciudad: "CDMX", telefono: "5551234567", correo: "maria.gonzalez@correo.com" },
        { id: 2, nombre: "Carlos Ramírez", calle: "Calle Reforma", numero: "45", colonia: "Juárez", cp: "06600", ciudad: "CDMX", telefono: "5559876543", correo: "carlos.ramirez@correo.com" },
        { id: 3, nombre: "Álvaro Núñez", calle: "Av. Constitución", numero: "810", colonia: "Centro", cp: "64000", ciudad: "Monterrey", telefono: "8112345678", correo: "alvaro.nunez@correo.com" },
        { id: 4, nombre: "Ana Beltrán", calle: "Calle Hidalgo", numero: "302", colonia: "Obispado", cp: "64060", ciudad: "Monterrey", telefono: "8187654321", correo: "ana.beltran@correo.com" }
    ];

    // ---------- Elementos ----------
    const lista = document.getElementById("lista-clientes");
    const buscador = document.getElementById("buscar-cliente");
    const selOrden = document.getElementById("orden-clientes");
    const selCiudad = document.getElementById("filtro-ciudad");
    const contador = document.getElementById("clientes-contador");
    const mensaje = document.getElementById("clientes-mensaje");

    // ---------- Modal de eliminación de clientes ----------
    const modalEliminarCliente = document.getElementById("modal-eliminar-cliente");
    const mensajeEliminarCliente = document.getElementById("mensaje-eliminar-cliente");
    const inputConfirmacionEliminarCliente = document.getElementById("confirmacion-eliminar-cliente");
    const errorConfirmacionEliminarCliente = document.getElementById("error-confirmacion-eliminar-cliente");
    const cancelarEliminacionCliente = document.getElementById("cancelar-eliminacion-cliente");
    const confirmarEliminacionCliente = document.getElementById("confirmar-eliminacion-cliente");
    const modalExitoCliente = document.getElementById("modal-exito-cliente");
    const mensajeExitoCliente = document.getElementById("mensaje-exito-cliente");
    const cerrarModalExitoCliente = document.getElementById("cerrar-modal-exito-cliente");

    // ---------- Modal de edición de clientes ----------
    const modalEditarCliente = document.getElementById("modal-editar-cliente");
    const formEditarCliente = document.getElementById("form-editar-cliente");

    const editarIdCliente = document.getElementById("editar-id-cliente");
    const editarNombreCliente = document.getElementById("editar-nombre-cliente");
    const editarDireccionCliente = document.getElementById("editar-direccion-cliente");
    const editarCpCliente = document.getElementById("editar-cp-cliente");
    const editarCiudadCliente = document.getElementById("editar-ciudad-cliente");
    const editarTelefonoCliente = document.getElementById("editar-telefono-cliente");
    const editarCorreoCliente = document.getElementById("editar-correo-cliente");

    const mensajeEditarCliente = document.getElementById("mensaje-editar-cliente");
    const cancelarEdicionCliente = document.getElementById("cancelar-edicion-cliente");
    const guardarEdicionCliente = document.getElementById("guardar-edicion-cliente");

    let clienteEnEdicion = null;

    let clientePendienteEliminar = null;
    let eliminacionEnCurso = false;

    let clientes = [];

    // ---------- Utilidades ----------
    // Escapa texto para que un nombre o correo con símbolos raros no rompa la página
    const esc = (v) =>
        String(v ?? "").replace(/[&<>"']/g, (ch) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[ch]));

    const sinAcentos = (s) =>
        String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    // Orden alfabético en español (Á junto a A, Ñ después de N, números en orden natural)
    const collator = new Intl.Collator("es", { sensitivity: "base", numeric: true });

    const ORDENES = {
        "nombre-asc": (a, b) => collator.compare(a.nombre, b.nombre),
        "nombre-desc": (a, b) => collator.compare(b.nombre, a.nombre),
        "id-desc": (a, b) => collator.compare(String(b.id), String(a.id)),
        "id-asc": (a, b) => collator.compare(String(a.id), String(b.id)),
        "ciudad-asc": (a, b) => collator.compare(a.ciudad, b.ciudad) || collator.compare(a.nombre, b.nombre)
    };

    function direccionCompleta(c) {
            if (c.direccion) return c.direccion;
            const calleNum = [c.calle, c.numero].filter(Boolean).join(" ");
            return [calleNum, c.colonia].filter(Boolean).join(", ");
        }
    function textoBuscable(c) {
        return sinAcentos([c.id, c.nombre, direccionCompleta(c), c.cp, c.ciudad, c.telefono, c.correo].join(" "));
    }

    function avisar(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = "clientes-mensaje clientes-mensaje--" + tipo;
    }

    // ---------- Pintar la tabla ----------
    function llenarCiudades() {
        const actual = selCiudad.value;
        const ciudades = [...new Set(clientes.map((c) => c.ciudad).filter(Boolean))].sort(collator.compare);
        selCiudad.innerHTML =
            '<option value="">Todas las ciudades</option>' +
            ciudades.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
        selCiudad.value = ciudades.includes(actual) ? actual : "";
    }

    function filaHTML(c) {
    const dir = direccionCompleta(c);

    return `
        <div class="row cliente-row" data-id="${esc(c.id)}">

            <div class="col sec">${esc(c.id)}</div>

            <div class="col sec" title="${esc(c.nombre)}">${esc(c.nombre)}</div>
            <div class="col sec" title="${esc(dir)}">${esc(dir)}</div>
            <div class="col sec">${esc(c.cp)}</div>
            <div class="col sec" title="${esc(c.ciudad)}">${esc(c.ciudad)}</div>
            <div class="col sec">${esc(c.telefono)}</div>
            <div class="col sec" title="${esc(c.correo)}">${esc(c.correo)}</div>
            <div class="col sec acciones-cliente">
                <div class="menu-acciones-cliente">
                    <button
                        type="button"
                        class="btn-menu-cliente"
                        aria-label="Acciones del cliente ${esc(c.nombre)}"
                        aria-expanded="false"
                        aria-haspopup="true"
                        data-id="${esc(c.id)}"
                    >
                        ⋮
                    </button>

                    <div class="opciones-cliente" hidden>
                        <button
                            type="button"
                            class="opcion-modificar-cliente"
                            data-id="${esc(c.id)}"
                        >
                            Modificar
                        </button>

                        <button
                            type="button"
                            class="opcion-eliminar-cliente"
                            data-id="${esc(c.id)}"
                            data-nombre="${esc(c.nombre)}"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

    function aplicar() {
        const q = sinAcentos(buscador.value.trim());
        const ciudad = selCiudad.value;

        const visibles = clientes
            .filter((c) => (!ciudad || c.ciudad === ciudad) && (!q || textoBuscable(c).includes(q)))
            .sort(ORDENES[selOrden.value] || ORDENES["nombre-asc"]);

        lista.innerHTML = visibles.length
            ? visibles.map(filaHTML).join("")
            : `<div class="clientes-vacio">${clientes.length ? "Ningún cliente coincide con la búsqueda." : "Aún no hay clientes registrados."}</div>`;

        contador.textContent = `Mostrando ${visibles.length} de ${clientes.length} clientes`;
    }

    // ---------- Cargar desde la base de datos ----------
    async function cargar() {
        lista.innerHTML = '<div class="clientes-vacio">Cargando clientes…</div>';
        try {
            let datos = DEMO;
            if (!MODO_DEMO) {
                const respuesta = await fetch(`${API_URL}/clientes`, {
                    method: "GET",
                    headers: cabeceras(),
                    credentials: "same-origin"
                });

                if (!respuesta.ok) throw new Error("Error " + respuesta.status);
                datos = (await respuesta.json()).map(normalizar);
            }
            clientes = datos;
            llenarCiudades();
            aplicar();
        } catch (error) {
            console.error("No se pudieron cargar los clientes:", error);
            lista.innerHTML = '<div class="clientes-vacio">No pudimos cargar los clientes. Intenta de nuevo más tarde.</div>';
            contador.textContent = "";
        }
    }

    // ---------- Eliminar ----------
    async function eliminar(id, nombre) {
        if (eliminacionEnCurso) return;

        eliminacionEnCurso = true;
        confirmarEliminacionCliente.disabled = true;
        cancelarEliminacionCliente.disabled = true;

        try {
            if (!MODO_DEMO) {
                const respuesta = await fetch(
                    `${API_URL}/cliente/${encodeURIComponent(id)}`,
                    {
                        method: "DELETE",
                        headers: cabeceras()
                    }
                );

                if (!respuesta.ok) {
                    const detalleError = await respuesta.text();

                    console.error("Error del backend al eliminar cliente:", {
                        status: respuesta.status,
                        statusText: respuesta.statusText,
                        detalle: detalleError,
                        idCliente: id
                    });

                    throw new Error(
                        `Error ${respuesta.status}: ${detalleError || respuesta.statusText}`
                    );
                }
            }

            clientes = clientes.filter(c => String(c.id) !== String(id));

            llenarCiudades();
            aplicar();

            // Limpiar los datos de la confirmación.
            inputConfirmacionEliminarCliente.value = "";
            errorConfirmacionEliminarCliente.textContent = "";
            clientePendienteEliminar = null;

            // Cerrar el modal de confirmación.
            cerrarModalEliminarCliente();

            // Mostrar el modal de éxito.
            mostrarModalExitoCliente(nombre);

            // Mantener bloqueado el desplazamiento mientras el modal esté abierto.
            document.body.style.overflow = "hidden";

        } catch (error) {
            console.error("No se pudo eliminar al cliente:", error);

            errorConfirmacionEliminarCliente.textContent =
                error.message || "Ocurrió un error al eliminar el cliente.";

        } finally {
            eliminacionEnCurso = false;
            cancelarEliminacionCliente.disabled = false;

            if (modalEliminarCliente.hidden) {
                confirmarEliminacionCliente.disabled = true;
            } else {
                actualizarBotonEliminarCliente();
            }
        }
    }

    // ---------- Modal de eliminación de clientes ----------
    function abrirModalEliminarCliente(id, nombre) {
        clientePendienteEliminar = { id, nombre };

        mensajeEliminarCliente.textContent =
            `¿Estás seguro de que deseas eliminar al cliente "${nombre}"?`;

        inputConfirmacionEliminarCliente.value = "";
        errorConfirmacionEliminarCliente.textContent = "";

        confirmarEliminacionCliente.disabled = true;

        modalEliminarCliente.hidden = false;

        document.body.style.overflow = "hidden";

        inputConfirmacionEliminarCliente.focus();
    }

    function cerrarModalEliminarCliente() {
        if (eliminacionEnCurso) return;

        modalEliminarCliente.hidden = true;

        inputConfirmacionEliminarCliente.value = "";
        errorConfirmacionEliminarCliente.textContent = "";

        clientePendienteEliminar = null;

        confirmarEliminacionCliente.disabled = true;

        document.body.style.overflow = "";

    }

    function mostrarModalExitoCliente(nombre) {
    // Asegurar que el modal de confirmación esté cerrado.
        modalEliminarCliente.hidden = true;

        mensajeExitoCliente.textContent =
            `El cliente "${nombre}" se eliminó correctamente.`;

        // Mostrar el modal de éxito.
        modalExitoCliente.hidden = false;
    }

    // ---------- Modal de edición de clientes ----------

    function abrirModalEditarCliente(id) {
        const cliente = clientes.find(
            c => String(c.id) === String(id)
        );

        if (!cliente) {
            avisar("No se encontró el cliente seleccionado.", "error");
            return;
        }

        clienteEnEdicion = cliente;

        editarIdCliente.value = cliente.id;
        editarNombreCliente.value = cliente.nombre;
        editarDireccionCliente.value = cliente.direccion;
        editarCpCliente.value = cliente.cp;
        editarCiudadCliente.value = cliente.ciudad;
        editarTelefonoCliente.value = cliente.telefono;
        editarCorreoCliente.value = cliente.correo;

        mensajeEditarCliente.textContent = "";

        modalEditarCliente.hidden = false;
        document.body.style.overflow = "hidden";

        editarNombreCliente.focus();
    }

    function cerrarModalEditarCliente() {
        modalEditarCliente.hidden = true;
        formEditarCliente.reset();
        mensajeEditarCliente.textContent = "";

        clienteEnEdicion = null;

        document.body.style.overflow = "";
    }

    // ---------- Guardar cambios del cliente ----------
    async function guardarCambiosCliente(event) {
        event.preventDefault();

        if (!clienteEnEdicion) {
            mensajeEditarCliente.textContent =
                "No se encontró el cliente que deseas modificar.";
            return;
        }

        const id = clienteEnEdicion.id;
        const idDireccion = clienteEnEdicion.idDireccion;

        const nombre = editarNombreCliente.value.trim();
        const direccion = editarDireccionCliente.value.trim();
        const cp = editarCpCliente.value.trim();
        const ciudad = editarCiudadCliente.value.trim();
        const telefono = editarTelefonoCliente.value.trim();
        const correo = editarCorreoCliente.value.trim();

        if (!nombre || !direccion || !cp || !ciudad || !telefono || !correo) {
            mensajeEditarCliente.textContent =
                "Completa todos los campos antes de guardar.";
            return;
        }

        if (!idDireccion) {
            mensajeEditarCliente.textContent =
                "No se encontró el identificador de la dirección. No se guardaron los cambios.";
            return;
        }

        guardarEdicionCliente.disabled = true;
        cancelarEdicionCliente.disabled = true;

        mensajeEditarCliente.textContent = "Guardando cambios...";

        try {
            // 1. Actualizar los datos del cliente.
            const respuestaCliente = await fetch(
                `${API_URL}/cliente/${encodeURIComponent(id)}`,
                {
                    method: "PUT",
                    headers: cabeceras(),
                    credentials: "same-origin",
                    body: JSON.stringify({
                        nombre,
                        telefono,
                        correo
                    })
                }
            );

            if (!respuestaCliente.ok) {
                const detalle = await respuestaCliente.text();

                if (respuestaCliente.status === 409) {
                    throw new Error(
                        "El correo o teléfono ya está registrado por otro cliente."
                    );
                }

                throw new Error(
                    `No se pudieron actualizar los datos del cliente (${respuestaCliente.status}). ${detalle}`
                );
            }

            // 2. Actualizar la dirección existente.
            const respuestaDireccion = await fetch(
                `${API_URL}/editar-direccion/${encodeURIComponent(idDireccion)}`,
                {
                    method: "PUT",
                    headers: cabeceras(),
                    credentials: "same-origin",
                    body: JSON.stringify({
                        lugarEntrega: direccion,
                        ciudad,
                        codigoPostal: cp
                    })
                }
            );

            if (!respuestaDireccion.ok) {
                const detalle = await respuestaDireccion.text();

                throw new Error(
                    `Los datos del cliente se actualizaron, pero no se pudo actualizar la dirección (${respuestaDireccion.status}). ${detalle}`
                );
            }

            // 3. Actualizar la tabla con los nuevos valores.
            clientes = clientes.map(cliente => {
                if (String(cliente.id) !== String(id)) {
                    return cliente;
                }

                return {
                    ...cliente,
                    nombre,
                    direccion,
                    cp,
                    ciudad,
                    telefono,
                    correo
                };
            });

            llenarCiudades();
            aplicar();

            cerrarModalEditarCliente();
            avisar("Los datos del cliente se actualizaron correctamente.", "ok");

        } catch (error) {
            console.error("Error al actualizar el cliente:", error);

            mensajeEditarCliente.textContent =
                error.message || "Ocurrió un error al guardar los cambios.";

        } finally {
            guardarEdicionCliente.disabled = false;
            cancelarEdicionCliente.disabled = false;
        }
    }

    function ocultarModalExitoCliente() {
        modalExitoCliente.hidden = true;
        document.body.style.overflow = "";
    }

    cerrarModalExitoCliente.addEventListener("click", ocultarModalExitoCliente);

    modalExitoCliente.addEventListener("click", (event) => {
        if (event.target === modalExitoCliente) {
            ocultarModalExitoCliente();
        }
    });

    function actualizarBotonEliminarCliente() {
        confirmarEliminacionCliente.disabled =
            inputConfirmacionEliminarCliente.value.trim().toLowerCase() !== "eliminar";
    }

    inputConfirmacionEliminarCliente.addEventListener(
        "input",
        () => {
            errorConfirmacionEliminarCliente.textContent = "";
            actualizarBotonEliminarCliente();
        }
    );

    cancelarEliminacionCliente.addEventListener(
        "click",
        cerrarModalEliminarCliente
    );

    confirmarEliminacionCliente.addEventListener(
        "click",
        () => {
            if (!clientePendienteEliminar || eliminacionEnCurso) return;

            if (
                inputConfirmacionEliminarCliente.value.trim().toLowerCase()
                !== "eliminar"
            ) {
                errorConfirmacionEliminarCliente.textContent =
                    'Debes escribir "eliminar" para continuar.';

                actualizarBotonEliminarCliente();
                return;
            }

            eliminar(
                clientePendienteEliminar.id,
                clientePendienteEliminar.nombre
            );
        }
    );

    // Cerrar al hacer clic en el fondo
    modalEliminarCliente.addEventListener("click", (e) => {
        if (e.target === modalEliminarCliente) {
            cerrarModalEliminarCliente();
        }
    });

    // Cerrar con Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modalEliminarCliente.hidden) {
            cerrarModalEliminarCliente();
        }
    });

    // ---------- Eventos ----------
    lista.addEventListener("click", (e) => {
        // Abrir o cerrar el menú de tres puntos
        const botonMenu = e.target.closest(".btn-menu-cliente");

        if (botonMenu) {
            const menuActual = botonMenu.nextElementSibling;
            const estabaAbierto = botonMenu.getAttribute("aria-expanded") === "true";

        // Cerrar los demás menús
        lista.querySelectorAll(".btn-menu-cliente").forEach((boton) => {
            boton.setAttribute("aria-expanded", "false");
            boton.nextElementSibling.hidden = true;
        });

        // Abrir el seleccionado si estaba cerrado
        if (!estabaAbierto) {
            menuActual.hidden = false;
            botonMenu.setAttribute("aria-expanded", "true");
        }

        return;
        }

        // Opción Eliminar
        const botonEliminar = e.target.closest(".opcion-eliminar-cliente");
        if (botonEliminar) {
            const { id, nombre } = botonEliminar.dataset;

            const menu = botonEliminar.closest(".opciones-cliente");
            menu.hidden = true;

            const boton = menu.previousElementSibling;
            boton.setAttribute("aria-expanded", "false");

            abrirModalEliminarCliente(id, nombre);

            return;
        }

        // Opción Modificar
        const botonModificar = e.target.closest(".opcion-modificar-cliente");
        if (botonModificar) {
            const id = botonModificar.dataset.id;

            // Cerrar el menú
            const menu = botonModificar.closest(".opciones-cliente");
            menu.hidden = true;

            const boton = menu.previousElementSibling;
            boton.setAttribute("aria-expanded", "false");

            abrirModalEditarCliente(id);

            return;
        }
    });

    cancelarEdicionCliente.addEventListener(
        "click",
        cerrarModalEditarCliente
    );

    formEditarCliente.addEventListener(
        "submit",
        guardarCambiosCliente
    );

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modalEditarCliente.hidden) {
            cerrarModalEditarCliente();
        }
    });

    // Cerrar los menús al hacer clic fuera de ellos
    document.addEventListener("click", (e) => {
        if (e.target.closest(".menu-acciones-cliente")) return;

        lista.querySelectorAll(".btn-menu-cliente").forEach((boton) => {
            boton.setAttribute("aria-expanded", "false");
            boton.nextElementSibling.hidden = true;
        });
    });

    buscador.addEventListener("input", aplicar);
    selCiudad.addEventListener("change", aplicar);
    selOrden.addEventListener("change", aplicar);

    cargar();
})();