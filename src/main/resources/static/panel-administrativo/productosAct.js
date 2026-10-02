import { productos } from "../js/products.js";

const contenedor = document.querySelector(".tabla-productos");

productos.forEach((p, index) => {
    const activo = p.estado === "activo";
    contenedor.insertAdjacentHTML("beforeend", `
        <div class="row fila-producto">
            <div class="col sec"><img src="${p.img}" alt="${p.name}" class="img-tabla"></div>
            <div class="col sec">${p.name}</div>
            <div class="col sec">$${p.precio}</div>
            <div class="col sec">${p.numeroDePersonas}</div>
            <div class="col sec">${p.descripcion.slice(0, 20)}...</div>
            <div class="col sec">
                <span class="estado-pill ${activo ? 'activo' : 'inactivo'}">
                    ${activo ? 'Activo' : 'No disponible'}
                </span>
            </div>
            <div class="col sec acciones-col">
                <button class="btn-editar" data-id="${index}">Editar producto</button>
                <a href="#" class="link-eliminar" data-id="${index}">Eliminar</a>
            </div>
        </div>
    `);
});

const modalEliminar = new bootstrap.Modal(document.getElementById("modalEliminar"));
let idAEliminar = null;

contenedor.addEventListener("click", (e) => {
    const link = e.target.closest(".link-eliminar");
    if (!link) return;
    e.preventDefault();

    idAEliminar = parseInt(link.dataset.id, 10);
    const p = productos[idAEliminar];

    document.getElementById("eliminar-img").src = p.img;
    document.getElementById("eliminar-nombre").textContent = p.name;
    document.getElementById("eliminar-descripcion").textContent = p.descripcion;
    document.getElementById("eliminar-precio").textContent = p.precio;
    document.getElementById("eliminar-specs").innerHTML = `
        <li>Número de personas: ${p.numeroDePersonas}</li>
        <li>Relleno: ${p.relleno}</li>
        <li>Cobertura: ${p.cobertura}</li>
        <li>Pan: ${p.pan}</li>
    `;

    modalEliminar.show();
});

document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
    // Todavía no hay backend conectado — por ahora solo cierra el modal.
    // Cuando tengan el endpoint de borrado, aquí va esa llamada.
    console.log("Pendiente: borrar producto index", idAEliminar);
    modalEliminar.hide();
});

// Modal de editar
const modalEditar = new bootstrap.Modal(document.getElementById("modalEditar"));
let idAEditar = null;

function opcionesUnicas(campo) {
    return [...new Set(productos.map(p => p[campo]))];
}

function llenarSelect(select, valores, seleccionado) {
    select.innerHTML = valores
        .map(v => `<option value="${v}" ${v === seleccionado ? "selected" : ""}>${v}</option>`)
        .join("");
}

contenedor.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-editar");
    if (!btn) return;

    idAEditar = parseInt(btn.dataset.id, 10);
    const p = productos[idAEditar];

    document.getElementById("editar-img-principal").src = p.img;
    document.querySelectorAll(".editar-miniatura").forEach(img => img.src = p.img);

    document.getElementById("editar-nombre").value = p.name;
    document.getElementById("editar-descripcion").value = p.descripcion;
    document.getElementById("editar-precio").value = p.precio;

    llenarSelect(document.getElementById("editar-personas"), opcionesUnicas("numeroDePersonas"), p.numeroDePersonas);
    llenarSelect(document.getElementById("editar-relleno"), opcionesUnicas("relleno"), p.relleno);
    llenarSelect(document.getElementById("editar-cobertura"), opcionesUnicas("cobertura"), p.cobertura);
    llenarSelect(document.getElementById("editar-pan"), opcionesUnicas("pan"), p.pan);

    modalEditar.show();
});

document.getElementById("form-editar-producto").addEventListener("submit", (e) => {
    e.preventDefault();
    const p = productos[idAEditar];
    p.name = document.getElementById("editar-nombre").value;
    p.descripcion = document.getElementById("editar-descripcion").value;
    p.precio = document.getElementById("editar-precio").value;
    p.numeroDePersonas = document.getElementById("editar-personas").value;
    p.relleno = document.getElementById("editar-relleno").value;
    p.cobertura = document.getElementById("editar-cobertura").value;
    p.pan = document.getElementById("editar-pan").value;

    // Todavía no hay backend conectado — por ahora solo guarda en memoria y cierra.
    console.log("Pendiente: guardar en backend", p);
    modalEditar.hide();
});