// topPastel.js
// Módulo encargado de mostrar el pastel más vendido de la semana
// en el dashboard general del ecommerce.
//
// Todo va envuelto en un IIFE para no ensuciar el scope global
// ni chocar con variables de otros archivos (ventasAno.js, etc.)
(function () {

// -----------------------------
// CONFIGURACIÓN
// -----------------------------
// Cuando el backend esté listo, solo cambia esta URL por el endpoint real.
// Ejemplo esperado: GET https://tuapi.com/api/pasteles/top-semana
const ENDPOINT_TOP_PASTEL = "https://tuapi.com/api/pasteles/top-semana";

// Si quieres probar el diseño sin backend, deja esto en true.
// Cuando conectes el backend real, cámbialo a false.
const USAR_DATOS_DEMO = true;

// Datos de ejemplo mientras no hay backend
const DATOS_DEMO = {
  nombre: "Pastel de Chocolate",
  imagen: "/images/pastel-de-chocolate.jpeg",
  ventas: 5,
};

// -----------------------------
// REFERENCIAS AL DOM
// -----------------------------
const imgPastel = document.getElementById("pastel-semanal");
const nombrePastel = document.getElementById("pastel");
const botonVentas = document.getElementById("pastel-ventas");

// GUARD: si este div no existe en la página actual (porque panel general
// admi.js se carga en TODAS las páginas del admin), no seguimos ejecutando
// para evitar el error "Cannot set properties of null".
if (!imgPastel || !nombrePastel || !botonVentas) {
  // Simplemente no hacemos nada más en esta página.
  return;
}

// -----------------------------
// FUNCIÓN: obtener datos del pastel top
// -----------------------------
async function obtenerTopPastel() {
  if (USAR_DATOS_DEMO) {
    return DATOS_DEMO;
  }

  try {
    const respuesta = await fetch(ENDPOINT_TOP_PASTEL);

    if (!respuesta.ok) {
      throw new Error(`Error en la petición: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    // Se espera un objeto con esta forma (ajusta según tu API real):
    // { nombre: "Pastel de Fresa", imagen: "url.jpg", ventas: 12 }
    return datos;
  } catch (error) {
    console.error("No se pudo obtener el pastel más vendido:", error);
    return null;
  }
}

// -----------------------------
// FUNCIÓN: pintar datos en el HTML
// -----------------------------
function mostrarTopPastel(datos) {
  if (!datos) {
    nombrePastel.textContent = "No disponible";
    botonVentas.textContent = "0 pasteles";
    return;
  }

  imgPastel.src = datos.imagen || "";
  imgPastel.alt = datos.nombre || "Pastel top";
  nombrePastel.textContent = datos.nombre || "Pastel";
  botonVentas.textContent = `${datos.ventas ?? 0} pasteles`;
}

// -----------------------------
// INICIALIZACIÓN
// -----------------------------
async function inicializarTopPastel() {
  const datos = await obtenerTopPastel();
  mostrarTopPastel(datos);
}

document.addEventListener("DOMContentLoaded", inicializarTopPastel);

})(); // cierre del IIFE