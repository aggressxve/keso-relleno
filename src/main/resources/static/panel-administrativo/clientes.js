/* =====================================================
   PÁGINA CLIENTES - carga, búsqueda, filtro, orden y eliminar
   Los datos vienen de la API de Spring Boot (base de datos).
   Para ver el diseño sin backend abre:  clientes.html?demo=1
===================================================== */
(() => {
    // ---------- Configuración ----------
    const API_URL = "http://localhost:8080/api/clientes";
    const DIRECCION_TIENDA = "Hacienda Purísima, Haciendas de Tizayuca, 43815 Haciendas de Tizayuca, Hgo.";
    const MODO_DEMO = new URLSearchParams(window.location.search).has("demo");

    // Si tu API pide token JWT, se envía desde aquí.
    // Cambia "token" por el nombre con el que lo guarda tu login-admin.
    function cabeceras() {
        const h = { "Content-Type": "application/json" };
        const token = localStorage.getItem("token");
        if (token) h.Authorization = "Bearer " + token;
        return h;
    }

    // Adapta ESTA función a los nombres de campos que devuelve tu API (Java).
    // Cada cliente se convierte en el mismo formato que usa la tabla.
        function normalizar(c) {
            const dirs = c.direcciones || [];
            // La dirección a domicilio más reciente del cliente (ignora la de la tienda)
            const d = [...dirs].reverse()
                .find((x) => x.lugarEntrega && x.lugarEntrega !== DIRECCION_TIENDA) || {};
            return {
                id: c.idCliente ?? c.id ?? "",
                nombre: [c.nombre, c.apellidos ?? c.apellido].filter(Boolean).join(" "),
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
            <div class="col sec">
                <button type="button" class="btn btn-sm btn-eliminar"
                    data-id="${esc(c.id)}" data-nombre="${esc(c.nombre)}">Eliminar</button>
            </div>
        </div>`;
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
                const respuesta = await fetch(API_URL, { headers: cabeceras() });
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
        if (!window.confirm(`¿Eliminar al cliente "${nombre}"?\nEsta acción no se puede deshacer.`)) return;

        try {
            if (!MODO_DEMO) {
                const respuesta = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
                    method: "DELETE",
                    headers: cabeceras()
                });
                if (!respuesta.ok) throw new Error("Error " + respuesta.status);
            }
            clientes = clientes.filter((c) => String(c.id) !== String(id));
            llenarCiudades();
            aplicar();
            avisar(`Cliente "${nombre}" eliminado.`, "ok");
        } catch (error) {
            console.error("No se pudo eliminar al cliente:", error);
            avisar("No se pudo eliminar al cliente. Puede tener pedidos u otros registros relacionados.", "error");
        }
    }

    // ---------- Eventos ----------
    lista.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn-eliminar");
        if (boton) eliminar(boton.dataset.id, boton.dataset.nombre);
    });

    buscador.addEventListener("input", aplicar);
    selCiudad.addEventListener("change", aplicar);
    selOrden.addEventListener("change", aplicar);

    cargar();
})();