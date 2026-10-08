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

const submitButton = document.getElementById("submitButton");

// Convierte "No aplica" en null
const valorOpcional = (valor) => valor === "No aplica" ? null : valor;

submitButton.addEventListener("click", () => {

    let data = {
        NombreProducto: dataElements.nombreProductoEl.value,
        Descripcion: dataElements.descripcionEl.value,
        Relleno: valorOpcional(dataElements.rellenoEl.value),
        Cobertura: valorOpcional(dataElements.coberturaEl.value),
        Pan: valorOpcional(dataElements.panEl.value),
        Precio: dataElements.precioEl.value || 0,
        NumeroPersonas: dataElements.numeroPersonasEl.value || 0,
        img: dataElements.imgEl.value || null
    };

    data.Precio = parseFloat(data.Precio);
    data.NumeroPersonas = parseInt(data.NumeroPersonas);

    let itemAdded = itemGenerator.addItem(data);
    let alertThrower = new AlertThrower(itemAdded);

    alertThrower.throwAlert();

    // Limpiar el formulario: los select vuelven a su primera opción
    Object.values(dataElements).forEach(element => {
        if (element.tagName === "SELECT") {
            element.selectedIndex = 0;
        } else {
            element.value = "";
        }
    });
})