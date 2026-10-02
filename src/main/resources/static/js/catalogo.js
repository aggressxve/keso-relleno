//Funcion que importa de products.js nombre, descripción y precio del producto en las cards.

/*
import { productos } from "./products.js";


const contenedor = document.getElementById("catalogo-contenedor");

productos.forEach((p, index) => {
    contenedor.insertAdjacentHTML("beforeend", `
        <div class="catalogo-card" id="${index + 1}">
            <img src="${p.img}" class="card-img-top" alt="${p.name}">
            <div class="card-body">
                <h5 class="card-title">${p.name}</h5>
                <p class="card-text">${p.descripcion}</p>
                <p class="catalogo-card-precio">$${p.precio}</p>
                <a href="subcatalogo.html?id=${index}" class="btn btn-primary">Ver más</a>
            </div>
        </div>
    `);
});*/

import { productos } from "./products.js";

const contenedor = document.getElementById("catalogo-contenedor");
const btnFiltros = document.getElementById("btn-filtros");

const CATEGORIAS = ["Tres leches", "Fresa", "Durazno", "Frutos rojos", "Nuez", "Oreo", "Chocolate", "Zanahoria", "Rompope", "Coco", "Flan"];

function textoBuscable(p) {
    return `${p.name} ${p.descripcion} ${p.pan || ""} ${p.relleno || ""} ${p.cobertura || ""}`.toLowerCase();
}

const personasUnicas = [...new Set(productos.map(p => p.numeroDePersonas))].sort((a, b) => a - b);
const precios = productos.map(p => p.precio);
const medio = Math.round((Math.min(...precios) + Math.max(...precios)) / 2);
const RANGOS_PRECIO = [
    { label: `Menos de $${medio}`, min: 0, max: medio - 1 },
    { label: `$${medio} o más`, min: medio, max: Infinity }
];

const filtros = { categorias: new Set(), personas: null, precio: null };
let panelAbierto = false;

function panelHTML() {
    return `
        <div class="catalogo-card filtro-panel" id="filtro-panel">
            <div class="filtro-header">
                <h5>Categoría</h5>
                <button type="button" id="cerrar-filtro" aria-label="Cerrar">✕</button>
            </div>
            <div class="filtro-opciones">
                ${CATEGORIAS.map(c => `<button type="button" class="pill-filtro ${filtros.categorias.has(c) ? 'activo' : ''}" data-tipo="categoria" data-valor="${c}">${c}</button>`).join("")}
            </div>
            <h5 class="filtro-subtitulo">Numero de personas</h5>
            <div class="filtro-opciones">
                ${personasUnicas.map(n => `<button type="button" class="pill-filtro ${filtros.personas === n ? 'activo' : ''}" data-tipo="personas" data-valor="${n}">${n}</button>`).join("")}
            </div>
            <h5 class="filtro-subtitulo">Precio</h5>
            <div class="filtro-opciones">
                ${RANGOS_PRECIO.map(r => `<button type="button" class="pill-filtro ${filtros.precio === r.label ? 'activo' : ''}" data-tipo="precio" data-valor="${r.label}">${r.label}</button>`).join("")}
            </div>
            <div class="filtro-borrar"><a href="#" id="borrar-filtros">Borrar Filtros</a></div>
        </div>
    `;
}

function productosFiltrados() {
    return productos
        .map((p, index) => ({ p, index }))
        .filter(({ p }) => {
            if (filtros.categorias.size > 0) {
                const texto = textoBuscable(p);
                if (![...filtros.categorias].every(c => texto.includes(c.toLowerCase()))) return false;
            }
            if (filtros.personas && p.numeroDePersonas !== filtros.personas) return false;
            if (filtros.precio) {
                const rango = RANGOS_PRECIO.find(r => r.label === filtros.precio);
                if (p.precio < rango.min || p.precio > rango.max) return false;
            }
            return true;
        });
}

function cardHTML(p, index) {
    return `
        <div class="catalogo-card" id="${index + 1}">
            <img src="${p.img}" class="card-img-top" alt="${p.name}">
            <div class="card-body">
                <h5 class="card-title">${p.name}</h5>
                <p class="card-text">${p.descripcion}</p>
                <p class="catalogo-card-precio">$${p.precio}</p>
                <a href="subcatalogo.html?id=${index}" class="btn btn-primary">Ver más</a>
            </div>
        </div>
    `;
}

function render() {
    const lista = productosFiltrados();
    contenedor.innerHTML = (panelAbierto ? panelHTML() : "") + lista.map(({ p, index }) => cardHTML(p, index)).join("");
    btnFiltros.classList.toggle("activo", panelAbierto);
    contenedor.classList.toggle("con-filtro", panelAbierto);
}

contenedor.addEventListener("click", (e) => {
    const pill = e.target.closest(".pill-filtro");
    if (pill) {
        const { tipo, valor } = pill.dataset;
        if (tipo === "categoria") {
            filtros.categorias.has(valor) ? filtros.categorias.delete(valor) : filtros.categorias.add(valor);
        } else if (tipo === "personas") {
            const n = Number(valor);
            filtros.personas = filtros.personas === n ? null : n;
        } else if (tipo === "precio") {
            filtros.precio = filtros.precio === valor ? null : valor;
        }
        render();
        return;
    }
    if (e.target.id === "cerrar-filtro") { panelAbierto = false; render(); }
    if (e.target.id === "borrar-filtros") {
        e.preventDefault();
        filtros.categorias.clear();
        filtros.personas = null;
        filtros.precio = null;
        render();
    }
});

btnFiltros.addEventListener("click", () => { panelAbierto = !panelAbierto; render(); });

render();

