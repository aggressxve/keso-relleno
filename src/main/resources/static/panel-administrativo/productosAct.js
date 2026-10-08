

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
                    <a href="#" class="link-eliminar" data-id="${id}" data-index="${index}">Desactivar</a>
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
    // Si el backend falla, la lista queda vacía (ya no hay datos locales de respaldo)
        console.error("No se pudo conectar con el backend:", error.message);
        productos = [];
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
    // Si no hay un producto seleccionado con id válido, no hacemos nada
    if (indexAEliminar === null || !pTieneIdBackend(idAEliminar)) return;

    try {
        const res = await fetch(`${URL_PASTELES}/${idAEliminar}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
        // Solo si el backend lo borró, lo quitamos de la tabla
        productos.splice(indexAEliminar, 1);
        renderTabla();
    } catch (err) {
        console.error("Error al eliminar en backend:", err);
        alert("No se pudo eliminar el producto. Intenta de nuevo.");
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

// Llena un select con datos del backend; cada opción lleva el id como value
// y deja marcada la que coincide con idSeleccionado
async function llenarSelectApi(select, url, campoId, campoTexto, idSeleccionado) {
    if (!select) return;
    const datos = await (await fetch(url)).json();
    select.innerHTML = datos
        .map(d => `<option value="${d[campoId]}" ${d[campoId] === idSeleccionado ? "selected" : ""}>${d[campoTexto]}</option>`)
        .join("");
}

document.querySelector(".tabla-productos")?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-editar");
    if (!btn) return;

    indexAEditar = parseInt(btn.dataset.index, 10);
    const p = productos[indexAEditar];
    if (!p) return;

    const imgSrc = obtenerRutaImagen(p.urlFoto || p.img);
    const imgPrincipal = document.getElementById("editar-img-principal");
    if (imgPrincipal) imgPrincipal.src = imgSrc;
    document.querySelectorAll(".editar-miniatura").forEach(img => img.src = imgSrc);
    // Limpia cualquier archivo elegido en una edición anterior
    document.getElementById("editar-archivo").value = "";

    // Al elegir una foto nueva, se muestra en el modal (todavía no se sube)
    document.getElementById("editar-archivo")?.addEventListener("change", (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;
        const vista = URL.createObjectURL(archivo);
        document.getElementById("editar-img-principal").src = vista;
        document.querySelectorAll(".editar-miniatura").forEach(img => img.src = vista);
    });

    document.getElementById("editar-nombre").value = p.nombre || p.name || "";
    document.getElementById("editar-descripcion").value = p.descripcion || "";
    document.getElementById("editar-precio").value = p.precio || 0;

    const personasVal = p.numeroDePersonas || 0;
    // cambios
    /*
    const rellenoVal = p.relleno?.saborRelleno || p.relleno || "";
    const coberturaVal = p.cubierta?.saborCubierta || p.cobertura || "";
    const panVal = p.pan?.nombre || p.pan || ""; */

    llenarSelect(
        document.getElementById("editar-personas"),
        opcionesUnicas(x => x.numeroDePersonas),
        personasVal
    );
    // Pan, relleno y cobertura se llenan desde la BD para que cada opción lleve su id
    await Promise.all([
        llenarSelectApi(document.getElementById("editar-pan"), "/api/panes", "idPan", "nombre", p.pan?.idPan),
        llenarSelectApi(document.getElementById("editar-relleno"), "/api/rellenos", "idRelleno", "saborRelleno", p.relleno?.idRelleno),
        llenarSelectApi(document.getElementById("editar-cobertura"), "/api/v1/cubiertas", "idCubierta", "saborCubierta", p.cubierta?.idCubierta)
    ]);

    if (modalEditar) modalEditar.show();
});

document.getElementById("form-editar-producto")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (indexAEditar === null) return;
    const p = productos[indexAEditar];

    // Pastel con los datos nuevos; pan, relleno y cobertura viajan como objetos con su id
    const pastelActualizado = {
        nombre: document.getElementById("editar-nombre").value,
        descripcion: document.getElementById("editar-descripcion").value,
        precio: parseFloat(document.getElementById("editar-precio").value),
        numeroDePersonas: parseInt(document.getElementById("editar-personas").value, 10),
        pan: { idPan: Number(document.getElementById("editar-pan").value) },
        relleno: { idRelleno: Number(document.getElementById("editar-relleno").value) },
        cubierta: { idCubierta: Number(document.getElementById("editar-cobertura").value) },
        // El topping no se edita aquí: se envía el que ya tenía para no borrarlo
        topping: p.topping ? { idTopping: p.topping.idTopping } : null
    };

    try {
            // Si se eligió una foto nueva, primero se sube y se usa la ruta que devuelve el servidor
            const archivo = document.getElementById("editar-archivo").files[0];
            if (archivo) {
                const formData = new FormData();
                formData.append("archivo", archivo);
                const resImg = await fetch("/api/imagenes", { method: "POST", body: formData });
                if (!resImg.ok) throw new Error("No se pudo subir la imagen");
                pastelActualizado.urlFoto = (await resImg.json()).urlFoto;
            }

        const res = await fetch(`${URL_PASTELES}/${p.idPastel}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pastelActualizado)
        });
        if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
        // Volvemos a pedir la lista a la BD para que la tabla muestre lo realmente guardado
        await cargarProductos();
        if (modalEditar) modalEditar.hide();
    } catch (error) {
        console.error("Error al guardar los cambios:", error);
        alert("No se pudieron guardar los cambios. Intenta de nuevo.");
    }
});

// Inicializar carga
cargarProductos();
