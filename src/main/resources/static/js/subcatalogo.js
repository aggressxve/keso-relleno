// Imagen de respaldo por si un pastel no tiene foto
const IMAGEN_RESPALDO = "https://cdn7.kiwilimon.com/recetaimagen/36187/640x640/44504.jpg.webp";

// Lee el id del pastel desde la URL (subcatalogo.html?id=3)
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"), 10);

// Quita la "/" inicial de la ruta de la foto para que sea relativa
const rutaFoto = (p) => p.urlFoto ? p.urlFoto.replace(/^\//, "") : IMAGEN_RESPALDO;

// Muestra el mensaje de error en lugar del detalle del producto
function mostrarNoEncontrado() {
  document.querySelector(".producto-detalle").innerHTML = "<p>Producto no encontrado.</p>";
}

async function cargarProducto() {
  try {
    // Pide al backend solo el pastel con ese id
    const respuesta = await fetch(`/api/pasteles/${id}`);
    if (!respuesta.ok) return mostrarNoEncontrado(); // 404 si ya no existe en la BD
    const producto = await respuesta.json();

    // Llena los textos básicos
    document.getElementById("producto-nombre").textContent = producto.nombre;
    document.getElementById("producto-descripcion").textContent = producto.descripcion;
    document.getElementById("producto-precio").textContent = `Precio: $${producto.precio}`;

    // El backend manda pan, relleno y cubierta como objetos, de ahí sacamos el texto
    document.getElementById("producto-specs").innerHTML = `
      <li>Número de personas: ${producto.numeroDePersonas}</li>
      <li>Relleno: ${producto.relleno?.saborRelleno || "no aplica"}</li>
      <li>Cobertura: ${producto.cubierta?.saborCubierta || "no aplica"}</li>
      <li>Pan: ${producto.pan?.nombre || "no aplica"}</li>
    `;

    // Imagen principal y miniaturas (por ahora repiten la misma foto)
    const imagenPrincipal = document.getElementById("producto-imagen-principal");
    imagenPrincipal.src = rutaFoto(producto);
    imagenPrincipal.alt = producto.nombre;
    document.querySelectorAll(".miniatura").forEach(img => {
      img.src = imagenPrincipal.src;
      img.alt = producto.nombre;
    });

    cargarOtrosPasteles();

    // Botón "agregar al carrito": guarda el producto en localStorage
    document.querySelector(".btn-agregar-carrito").addEventListener("click", () => {
      const cantidad = Math.max(
        1,
        parseInt(document.getElementById("cantidad").value, 10) || 1
      );

      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const existente = carrito.find((item) => item.id === id);

      if (existente) {
        existente.cantidad += cantidad; // ya estaba: solo suma la cantidad
      } else {
        carrito.push({
          id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad,
          imagen: rutaFoto(producto)
        });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      window.location.href = "Carrito.html";
    });
  } catch (error) {
    console.error("No se pudo cargar el producto:", error);
    mostrarNoEncontrado();
  }
}

// "Otros pasteles": 3 sugerencias al azar, sin repetir el actual
async function cargarOtrosPasteles() {
  try {
    const respuesta = await fetch("/api/pasteles");
    const pasteles = await respuesta.json();

    const otros = pasteles
      .filter(p => p.idPastel !== id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    document.getElementById("otros-pasteles").innerHTML = otros.map(p => `
      <a href="subcatalogo.html?id=${p.idPastel}" class="otro-pastel">
        <img src="${rutaFoto(p)}" alt="${p.nombre}">
        <p>${p.nombre}</p>
      </a>
    `).join("");
  } catch (error) {
    console.error("No se pudieron cargar los otros pasteles:", error);
  }
}

cargarProducto();