import { productos as productosFallback } from "../js/products.js";

const URL_PASTELES = "http://localhost:8080/api/pasteles";
const contenedorLista = document.getElementById("lista-productos") || document.querySelector(".tabla-productos");
let productos = [];

// Helper para ajustar la ruta de imágenes relativas al panel administrativo
function obtenerRutaImagen(url) {
    if (!url) return "../images/pastel-referencia.png";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
        return url;
    }
    // Si empieza con "/", anteponemos ".." para salir de panel-administrativo
    if (url.startsWith("/")) {
        return ".." + url;
    }
    // Si ya empieza con "./" o "../", la dejamos o adaptamos
    if (url.startsWith("./")) {
        return "." + url;
    }
    return "../" + url;
}

// Renderizar tabla de productos
function renderTabla() {
    if (!contenedorLista) return;
    contenedorLista.innerHTML = "";

    if (productos.length === 0) {
        contenedorLista.innerHTML = `<div class="p-4 text-center">No hay productos disponibles.</div>`;
        return;
    }

    productos.forEach((p, index) => {
        const id = p.idPastel !== undefined ? p.idPastel : index;
        const nombre = p.nombre || p.name || "Sin nombre";
        const precio = p.precio !== undefined ? p.precio : 0;
        const porcion = p.numeroDePersonas || 0;
        const descripcion = p.descripcion || "";
        const activo = p.estado ? p.estado === "activo" : true;
        const imgSrc = obtenerRutaImagen(p.urlFoto || p.img);

        contenedorLista.insertAdjacentHTML("beforeend", `
            <div class="row fila-producto" data-id="${id}" data-index="${index}">
                <div class="col sec"><img src="${imgSrc}" alt="${nombre}" class="img-tabla" onerror="this.src='../images/pastel-referencia.png'"></div>
                <div class="col sec">${nombre}</div>
                <div class="col sec">$${precio}</div>
                <div class="col sec">${porcion}</div>
                <div class="col sec">${descripcion.length > 25 ? descripcion.slice(0, 25) + "..." : descripcion}</div>
                <div class="col sec">
                    <span class="estado-pill ${activo ? 'activo' : 'inactivo'}">
                        ${activo ? 'Activo' : 'No disponible'}
                    </span>
                </div>
                <div class="col sec acciones-col">
                    <button class="btn-editar" data-id="${id}" data-index="${index}">Editar producto</button>
                    <a href="#" class="link-eliminar" data-id="${id}" data-index="${index}">Eliminar</a>
                </div>
            </div>
        `);
    });
}

// Cargar pasteles desde el backend con fallback
async function cargarProductos() {
    try {
        const respuesta = await fetch(URL_PASTELES);
        if (!respuesta.ok) {
            throw new Error(`Error en el servidor: ${respuesta.status}`);
        }
        const datos = await respuesta.json();
        console.log("Pasteles cargados desde la base de datos (Backend):", datos);
        productos = datos;
    } catch (error) {
        console.warn("No se pudo conectar con el backend. Usando datos locales de respaldo:", error.message);
        productos = [...productosFallback];
    }
    renderTabla();
}

// Modales de Bootstrap
const modalEliminarEl = document.getElementById("modalEliminar");
const modalEliminar = modalEliminarEl ? new bootstrap.Modal(modalEliminarEl) : null;
let indexAEliminar = null;
let idAEliminar = null;

document.querySelector(".tabla-productos")?.addEventListener("click", (e) => {
    const link = e.target.closest(".link-eliminar");
    if (!link) return;
    e.preventDefault();

    indexAEliminar = parseInt(link.dataset.index, 10);
    idAEliminar = link.dataset.id;
    const p = productos[indexAEliminar];
    if (!p) return;

    const nombre = p.nombre || p.name || "";
    const descripcion = p.descripcion || "";
    const precio = p.precio || 0;
    const porcion = p.numeroDePersonas || 0;
    const relleno = p.relleno?.saborRelleno || p.relleno || "No aplica";
    const cobertura = p.cubierta?.saborCubierta || p.cobertura || "No aplica";
    const pan = p.pan?.nombre || p.pan || "No aplica";

    const imgEliminar = document.getElementById("eliminar-img");
    if (imgEliminar) imgEliminar.src = obtenerRutaImagen(p.urlFoto || p.img);
    
    document.getElementById("eliminar-nombre").textContent = nombre;
    document.getElementById("eliminar-descripcion").textContent = descripcion;
    document.getElementById("eliminar-precio").textContent = precio;
    document.getElementById("eliminar-specs").innerHTML = `
        <li>Número de personas: ${porcion}</li>
        <li>Relleno: ${relleno}</li>
        <li>Cobertura: ${cobertura}</li>
        <li>Pan: ${pan}</li>
    `;

    if (modalEliminar) modalEliminar.show();
});

document.getElementById("btnConfirmarEliminar")?.addEventListener("click", async () => {
    if (idAEliminar !== null && pTieneIdBackend(idAEliminar)) {
        try {
            const res = await fetch(`${URL_PASTELES}/${idAEliminar}`, { method: "DELETE" });
            if (res.ok) {
                console.log(`Producto ID ${idAEliminar} eliminado en backend.`);
            }
        } catch (err) {
            console.error("Error al eliminar en backend:", err);
        }
    }
    // Eliminar localmente de la lista y redibujar
    if (indexAEliminar !== null) {
        productos.splice(indexAEliminar, 1);
        renderTabla();
    }
    if (modalEliminar) modalEliminar.hide();
});

function pTieneIdBackend(id) {
    return !isNaN(parseInt(id, 10)) && parseInt(id, 10) > 0;
}

// Modal de editar
const modalEditarEl = document.getElementById("modalEditar");
const modalEditar = modalEditarEl ? new bootstrap.Modal(modalEditarEl) : null;
let indexAEditar = null;

function opcionesUnicas(fn) {
    return [...new Set(productos.map(fn).filter(Boolean))];
}

function llenarSelect(select, valores, seleccionado) {
    if (!select) return;
    select.innerHTML = valores
        .map(v => `<option value="${v}" ${v == seleccionado ? "selected" : ""}>${v}</option>`)
        .join("");
}

document.querySelector(".tabla-productos")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-editar");
    if (!btn) return;

    indexAEditar = parseInt(btn.dataset.index, 10);
    const p = productos[indexAEditar];
    if (!p) return;

    const imgSrc = obtenerRutaImagen(p.urlFoto || p.img);
    const imgPrincipal = document.getElementById("editar-img-principal");
    if (imgPrincipal) imgPrincipal.src = imgSrc;
    document.querySelectorAll(".editar-miniatura").forEach(img => img.src = imgSrc);

    document.getElementById("editar-nombre").value = p.nombre || p.name || "";
    document.getElementById("editar-descripcion").value = p.descripcion || "";
    document.getElementById("editar-precio").value = p.precio || 0;

    const personasVal = p.numeroDePersonas || 0;
    const rellenoVal = p.relleno?.saborRelleno || p.relleno || "";
    const coberturaVal = p.cubierta?.saborCubierta || p.cobertura || "";
    const panVal = p.pan?.nombre || p.pan || "";

    llenarSelect(
        document.getElementById("editar-personas"),
        opcionesUnicas(x => x.numeroDePersonas),
        personasVal
    );
    llenarSelect(
        document.getElementById("editar-relleno"),
        opcionesUnicas(x => x.relleno?.saborRelleno || x.relleno),
        rellenoVal
    );
    llenarSelect(
        document.getElementById("editar-cobertura"),
        opcionesUnicas(x => x.cubierta?.saborCubierta || x.cobertura),
        coberturaVal
    );
    llenarSelect(
        document.getElementById("editar-pan"),
        opcionesUnicas(x => x.pan?.nombre || x.pan),
        panVal
    );

    if (modalEditar) modalEditar.show();
});

document.getElementById("form-editar-producto")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (indexAEditar === null) return;
    const p = productos[indexAEditar];

    const nuevoNombre = document.getElementById("editar-nombre").value;
    const nuevaDesc = document.getElementById("editar-descripcion").value;
    const nuevoPrecio = parseFloat(document.getElementById("editar-precio").value);
    const nuevasPersonas = parseInt(document.getElementById("editar-personas").value, 10);

    // Actualizamos propiedades locales
    if (p.nombre !== undefined) p.nombre = nuevoNombre;
    if (p.name !== undefined) p.name = nuevoNombre;
    p.descripcion = nuevaDesc;
    p.precio = nuevoPrecio;
    p.numeroDePersonas = nuevasPersonas;

    renderTabla();
    if (modalEditar) modalEditar.hide();
});

// Inicializar carga
cargarProductos();
