import { ItemGenerator } from './itemscontroller.js';
import { AlertThrower } from './alertThrower.js';

let itemGenerator = new ItemGenerator();

let dataElements = {
    nombreProductoEl: document.getElementById("NombreProducto"),
    descripcionEl: document.getElementById("Descripcion"),
    rellenoEl: document.getElementById("Relleno"),
    coberturaEl: document.getElementById("Cobertura"),
    panEl: document.getElementById("Pan"),
    precioEl: document.getElementById("Precio"),
    numeroPersonasEl: document.getElementById("NumeroPersonas"),
    imgEl: document.querySelector('input[type="file"]'),
}

//----- llenar los selects desde la DB diana
const NUEVO = "__nuevo__";

// Al elegir la opción "nuevo", el select se cambia por una barra de texto
function crearBarraNueva(select, placeholder, tipo = "text") {
    const wrap = document.createElement("div");
    wrap.className = "d-none align-items-center gap-2";
    wrap.innerHTML = `
        <input type="${tipo}" class="form-controlP" placeholder="${placeholder}" ${tipo === "number" ? 'min="1"' : ""}>
        <button type="button" class="btn-close" aria-label="Volver a la lista"></button>`;
    select.after(wrap);

    const input = wrap.querySelector("input");
    select.addEventListener("change", () => {
        if (select.value !== NUEVO) return;
        select.classList.add("d-none");
        wrap.classList.replace("d-none", "d-flex");
        input.focus();
    });
    wrap.querySelector(".btn-close").addEventListener("click", () => {
        input.value = "";
        wrap.classList.replace("d-flex", "d-none");
        select.classList.remove("d-none");
        select.selectedIndex = 0;
    });
    return { wrap, input };
}

const nuevos = {
    pan: crearBarraNueva(dataElements.panEl, "Escribe el nuevo pan"),
    relleno: crearBarraNueva(dataElements.rellenoEl, "Escribe el nuevo relleno"),
    cobertura: crearBarraNueva(dataElements.coberturaEl, "Escribe la nueva cobertura"),
    personas: crearBarraNueva(dataElements.numeroPersonasEl, "Escribe el número de personas", "number"),
};

async function llenarSelect(select, url, campoId, campoTexto, textoNuevo) {
    const respuesta = await fetchConAuth(url);
    const datos = await respuesta.json();
    select.innerHTML = `<option value="">Selecciona una opción</option>` +
        datos.map(d => `<option value="${d[campoId]}">${d[campoTexto]}</option>`).join("") +
        `<option value="${NUEVO}">${textoNuevo}</option>`;
}

function cargarOpciones() {
    llenarSelect(dataElements.panEl, "/api/panes", "idPan", "nombre", "Nuevo pan");
    llenarSelect(dataElements.rellenoEl, "/api/rellenos", "idRelleno", "saborRelleno", "Nuevo relleno");
    llenarSelect(dataElements.coberturaEl, "/api/v1/cubiertas", "idCubierta", "saborCubierta", "Nueva cobertura");
}
cargarOpciones();

// Número de personas es un select estático: la opción se agrega a mano
dataElements.numeroPersonasEl.insertAdjacentHTML("beforeend", `<option value="${NUEVO}">Nuevo número de personas</option>`);
// ---- aqui termina diana

//Esta linea ya estaba (Kevin )
const submitButton = document.getElementById("submitButton");

// Convierte "No aplica" en null
const valorOpcional = (valor) => valor === "No aplica" ? null : valor;

const valorONuevo = (select, nuevo) =>
    select.value === NUEVO ? nuevo.input.value.trim() : select.value;

// Devuelve el id. Si eligió "nuevo", lo crea en la BD (o reutiliza uno con el mismo nombre)
async function resolverId(select, input, url, campoId, campoTexto) {
    if (select.value !== NUEVO) return Number(select.value);

    const texto = input.value.trim();
    const existente = [...select.options].find(o =>
        o.value !== NUEVO && o.text.trim().toLowerCase() === texto.toLowerCase());
    if (existente) return Number(existente.value);

    const res = await fetchConAuth(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [campoTexto]: texto })
    });
    if (!res.ok) throw new Error(`No se pudo crear "${texto}"`);
    return (await res.json())[campoId];
}

//parte de diana
async function guardarPastel(data, archivo) {
    try {
        const formData = new FormData();
        formData.append("archivo", archivo);
        const resImg = await fetchConAuth("/api/imagenes", { method: "POST", body: formData });
        if (!resImg.ok) throw new Error("No se pudo subir la imagen");
        const { urlFoto } = await resImg.json();

        const idPan = await resolverId(dataElements.panEl, nuevos.pan.input, "/api/panes", "idPan", "nombre");
        const idRelleno = await resolverId(dataElements.rellenoEl, nuevos.relleno.input, "/api/rellenos", "idRelleno", "saborRelleno");
        const idCubierta = await resolverId(dataElements.coberturaEl, nuevos.cobertura.input, "/api/v1/cubiertas", "idCubierta", "saborCubierta");

        const pastel = {
            nombre: data.NombreProducto,
            descripcion: data.Descripcion,
            numeroDePersonas: data.NumeroPersonas,
            precio: data.Precio,
            urlFoto: urlFoto,
            pan: { idPan },
            relleno: { idRelleno },
            cubierta: { idCubierta }
        };
        const resPastel = await fetchConAuth("/api/pasteles/create-pastel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pastel)
        });
        if (!resPastel.ok) throw new Error("No se pudo guardar el pastel");
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

submitButton.addEventListener("click", async () => {

    let data = {
        NombreProducto: dataElements.nombreProductoEl.value,
        Descripcion: dataElements.descripcionEl.value,
        Relleno: valorONuevo(dataElements.rellenoEl, nuevos.relleno),
        Cobertura: valorONuevo(dataElements.coberturaEl, nuevos.cobertura),
        Pan: valorONuevo(dataElements.panEl, nuevos.pan),
        Precio: dataElements.precioEl.value || 0,
        NumeroPersonas: valorONuevo(dataElements.numeroPersonasEl, nuevos.personas) || 0,
        img: dataElements.imgEl.value || null
    };

    data.Precio = parseFloat(data.Precio);
    data.NumeroPersonas = parseInt(data.NumeroPersonas);

    if (!(data.NumeroPersonas > 0)) data.NumeroPersonas = 0;

    const archivo = dataElements.imgEl.files[0];
    let itemAdded = itemGenerator.addItem(data);
    itemAdded = itemAdded && archivo ? await guardarPastel(data, archivo) : false;

    let alertThrower = new AlertThrower(itemAdded);
    alertThrower.throwAlert();

    if (itemAdded) {
        Object.values(dataElements).forEach(element => {
            element.value = "";
        });
        Object.values(nuevos).forEach(n => n.wrap.querySelector(".btn-close").click()); // cierra las barras
        cargarOpciones(); // para que el relleno/pan/cobertura recién creado aparezca en la lista
    }
})



