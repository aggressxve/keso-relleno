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
async function llenarSelect(select, url, campoId, campoTexto) {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    select.innerHTML = `<option value="">Selecciona una opción</option>` +
        datos.map(d => `<option value="${d[campoId]}">${d[campoTexto]}</option>`).join("");
}

llenarSelect(dataElements.panEl, "/api/panes", "idPan", "nombre");
llenarSelect(dataElements.rellenoEl, "/api/rellenos", "idRelleno", "saborRelleno");
llenarSelect(dataElements.coberturaEl, "/api/v1/cubiertas", "idCubierta", "saborCubierta");
// ---- aqui termina diana

//Esta linea ya estaba (Kevin )
const submitButton = document.getElementById("submitButton");

//parte de diana
async function guardarPastel(data, archivo) {
    try {
        const formData = new FormData();
        formData.append("archivo", archivo);
        const resImg = await fetch("/api/imagenes", { method: "POST", body: formData });
        if (!resImg.ok) throw new Error("No se pudo subir la imagen");
        const { urlFoto } = await resImg.json();

        const pastel = {
            nombre: data.NombreProducto,
            descripcion: data.Descripcion,
            numeroDePersonas: data.NumeroPersonas,
            precio: data.Precio,
            urlFoto: urlFoto,
            pan: { idPan: Number(data.Pan) },
            relleno: { idRelleno: Number(data.Relleno) },
            cubierta: { idCubierta: Number(data.Cobertura) }
        };
        const resPastel = await fetch("/api/pasteles/create-pastel", {
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
        Relleno: dataElements.rellenoEl.value,
        Cobertura: dataElements.coberturaEl.value,
        Pan: dataElements.panEl.value,
        Precio: dataElements.precioEl.value || 0,
        NumeroPersonas: dataElements.numeroPersonasEl.value || 0,
        img: dataElements.imgEl.value || null
    };

    data.Precio = parseFloat(data.Precio);
    data.NumeroPersonas = parseInt(data.NumeroPersonas);

    const archivo = dataElements.imgEl.files[0];
    let itemAdded = itemGenerator.addItem(data);
    itemAdded = itemAdded && archivo ? await guardarPastel(data, archivo) : false;

    let alertThrower = new AlertThrower(itemAdded);
    alertThrower.throwAlert();

    if (itemAdded) {
        Object.values(dataElements).forEach(element => {
            element.value = "";
        });
    }
})



/*
kevin
submitButton.addEventListener("click", () => {

    let data = {
        NombreProducto: dataElements.nombreProductoEl.value,
        Descripcion: dataElements.descripcionEl.value,
        Relleno: dataElements.rellenoEl.value,
        Cobertura: dataElements.coberturaEl.value,
        Pan: dataElements.panEl.value,
        Precio: dataElements.precioEl.value || 0,
        NumeroPersonas: dataElements.numeroPersonasEl.value || 0,
        img: dataElements.imgEl.value || null
    };

    data.Precio = parseFloat(data.Precio);
    data.NumeroPersonas = parseInt(data.NumeroPersonas);

    let itemAdded = itemGenerator.addItem(data);
    let alertThrower = new AlertThrower(itemAdded);

    alertThrower.throwAlert();

    Object.values(dataElements).forEach(element => {
        element.value = "";
    });
})*/
