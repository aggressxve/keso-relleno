// ventasAno.js
// Módulo encargado de mostrar la gráfica de "Ventas del año"
// en el dashboard general del ecommerce.
//
// Todo va envuelto en un IIFE para no ensuciar el scope global
// ni chocar con variables de otros archivos (topPastel.js, etc.)
(function () {

// -----------------------------
// CONFIGURACIÓN
// -----------------------------
// Cuando el backend esté listo, cambia esta URL por el endpoint real.
// Ejemplo esperado: GET https://tuapi.com/api/pedidos/ventas-anuales
const ENDPOINT_VENTAS_ANO = "https://tuapi.com/api/pedidos/ventas-anuales";

// Si quieres probar el diseño sin backend, deja esto en true.
const USAR_DATOS_DEMO = true;

// Datos de ejemplo mientras no hay backend
// Cada objeto representa un mes con su cantidad de pasteles vendidos
const DATOS_DEMO = [
  { mes: "Ene", cantidad: 32 },
  { mes: "Feb", cantidad: 58 },
  { mes: "Mar", cantidad: 40 },
  { mes: "Abr", cantidad: 14 },
  { mes: "May", cantidad: 55 },
  { mes: "Jun", cantidad: 20 },
  { mes: "Jul", cantidad: 25 },
  { mes: "Ago", cantidad: 30 },
];

// -----------------------------
// REFERENCIAS AL DOM
// -----------------------------
const contenedorBarras = document.getElementById("chart-bars");
const contenedorEtiquetas = document.getElementById("chart-labels");
const textoPromedio = document.getElementById("cant");

// GUARD: si este div no existe en la página actual, no seguimos ejecutando.
if (!contenedorBarras || !contenedorEtiquetas || !textoPromedio) {
  return;
}

// -----------------------------
// FUNCIÓN: obtener datos de ventas
// -----------------------------
async function obtenerVentasAno() {
  if (USAR_DATOS_DEMO) {
    return DATOS_DEMO;
  }

  try {
    const respuesta = await fetch(ENDPOINT_VENTAS_ANO);

    if (!respuesta.ok) {
      throw new Error(`Error en la petición: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    // Se espera un arreglo con esta forma (ajusta según tu API real):
    // [ { mes: "Ene", cantidad: 32 }, { mes: "Feb", cantidad: 58 }, ... ]
    return datos;
  } catch (error) {
    console.error("No se pudieron obtener las ventas del año:", error);
    return [];
  }
}

// -----------------------------
// FUNCIÓN: pintar la gráfica
// -----------------------------
function mostrarVentasAno(datos) {
  contenedorBarras.innerHTML = "";
  contenedorEtiquetas.innerHTML = "";

  if (!datos || datos.length === 0) {
    textoPromedio.textContent = "Sin datos";
    return;
  }

  const cantidades = datos.map((d) => d.cantidad);
  const maximo = Math.max(...cantidades);
  const promedio = Math.round(
    cantidades.reduce((suma, valor) => suma + valor, 0) / cantidades.length
  );

  textoPromedio.textContent = `${promedio} pasteles`;

  // Encuentra el mes con más ventas para resaltarlo (como en el diseño)
  const indiceMax = cantidades.indexOf(maximo);

  datos.forEach((dato, index) => {
    // Barra
    const barra = document.createElement("div");
    barra.classList.add("bar");
    if (index === indiceMax) {
      barra.classList.add("activo");
    }
    // Altura proporcional al valor máximo (mínimo 4% para que no desaparezca)
    const alturaPorcentaje = Math.max((dato.cantidad / maximo) * 100, 4);
    barra.style.height = `${alturaPorcentaje}%`;
    contenedorBarras.appendChild(barra);

    // Etiqueta
    const etiqueta = document.createElement("span");
    etiqueta.textContent = dato.mes;
    contenedorEtiquetas.appendChild(etiqueta);
  });
}

// -----------------------------
// INICIALIZACIÓN
// -----------------------------
async function inicializarVentasAno() {
  const datos = await obtenerVentasAno();
  mostrarVentasAno(datos);
}

document.addEventListener("DOMContentLoaded", inicializarVentasAno);

})(); // cierre del IIFE