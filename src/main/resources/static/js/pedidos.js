const pedidos = [
    {
        id: "PED-001",
        cliente: "Juan Pérez",
        fecha: "13 Oct 2026",
        entrega: "2:00 pm - 4:00 pm",
        estado: "Pendiente"
    },
    {
        id: "PED-002",
        cliente: "Ana López",
        fecha: "13 Oct 2026",
        entrega: "4:00 pm - 6:00 pm",
        estado: "En preparación"
    },
    {
        id: "PED-003",
        cliente: "Carlos Hernández",
        fecha: "13 Oct 2026",
        entrega: "6:00 pm - 8:00 pm",
        estado: "Entregado"
    },
    {
        id: "PED-004",
        cliente: "Brandon Garcia",
        fecha: "13 Oct 2026",
        entrega: "6:00 pm - 10:00 pm",
        estado: "En reparto"
    },
    {
        id: "PED-003",
        cliente: "Carlos Hernández",
        fecha: "13 Oct 2026",
        entrega: "6:00 pm - 8:00 pm",
        estado: "Entregado"
    },
    {
        id: "PED-004",
        cliente: "Brandon Garcia",
        fecha: "13 Oct 2026",
        entrega: "6:00 pm - 10:00 pm",
        estado: "En reparto"
    },
    {
        id: "PED-003",
        cliente: "Carlos Hernández",
        fecha: "13 Oct 2026",
        entrega: "6:00 pm - 8:00 pm",
        estado: "Entregado"
    },
    {
        id: "PED-004",
        cliente: "Brandon Garcia",
        fecha: "13 Oct 2026",
        entrega: "6:00 pm - 10:00 pm",
        estado: "En reparto"
    },
    {
        id: "PED-003",
        cliente: "Carlos Hernández",
        fecha: "13 Oct 2026",
        entrega: "6:00 pm - 8:00 pm",
        estado: "Entregado"
    },
    {
        id: "PED-004",
        cliente: "Brandon Garcia",
        fecha: "13 Oct 2026",
        entrega: "6:00 pm - 10:00 pm",
        estado: "En reparto"
    },
    {
        id: "PED-003",
        cliente: "Carlos Hernández",
        fecha: "13 Oct 2026",
        entrega: "6:00 pm - 8:00 pm",
        estado: "Entregado"
    },
    {
        id: "PED-004",
        cliente: "Brandon Garcia",
        fecha: "13 Oct 2026",
        entrega: "6:00 pm - 10:00 pm",
        estado: "En reparto"
    }

    
    

]

const listaPedidos = document.getElementById("lista-pedidos")

if (!listaPedidos) {
  console.error("No se encontró el elemento con id 'lista-pedidos'")
} else {

  pedidos.forEach((pedido, index) => {
    const fila = document.createElement("div")
    fila.classList.add("row", "pedido")

    if (index === 0) {
      fila.classList.add("pedido-first")
    } else {
      fila.classList.add("pedido-rest")
    }

    fila.innerHTML = `
      <div class="col sc">${pedido.id}</div>
      <div class="col sc">${pedido.cliente}</div>
      <div class="col sc">${pedido.fecha}</div>
      <div class="col sc">${pedido.entrega}</div>
      <div class="col sc">
        <div class="row justify-content-md-center">
          <div class="col-auto estado">${pedido.estado}</div>
        </div>
      </div>
      <div class="col">
        <a href="./" class="vermas">Ver más</a>
      </div>
    `

    const estadoCol = fila.querySelector(".estado")
    if (pedido.estado === "Pendiente") {
        estadoCol.classList.add("estado-pendiente")
    }else if (pedido.estado === "Entregado") {
        estadoCol.classList.add("estado-entregado")
    }else if (pedido.estado === "En reparto") {
        estadoCol.classList.add("estado-en-reparto")
    }else if (pedido.estado === "En preparación") {
        estadoCol.classList.add("estado-en-preparacion")
    }

    listaPedidos.appendChild(fila)
  })
  
}





const listaCorta = document.getElementById("lista-corta")

if (!listaCorta) {
  console.error("No se encontró el elemento con id 'lista-corta'")
} else {

  // Lee el atributo data-limite del HTML.
  // Si existe (ej. data-limite="3"), corta el array con slice().
  // Si no existe (undefined), usa el array completo de pedidos.
  const limite = listaCorta.dataset.limite
  const pedidosAMostrar = limite ? pedidos.slice(0, parseInt(limite)) : pedidos

  pedidosAMostrar.forEach((pedido, index) => {
    const fila = document.createElement("div")
    fila.classList.add("row", "pedido")

    if (index === 0) {
      fila.classList.add("pedido-first")
    } else {
      fila.classList.add("pedido-rest")
    }

    fila.innerHTML = `
      <div class="col prim">${pedido.id}</div>
      <div class="col sc">${pedido.cliente}</div>
      <div class="col sc">${pedido.fecha}</div>
      <div class="col sc">${pedido.entrega}</div>
      <div class="col sc">
        <div class="row justify-content-md-center">
          <div class="col-auto estado">${pedido.estado}</div>
        </div>
      </div>
      <div class="col">
        <a href="./" class="vermas">Ver más</a>
      </div>
    `

    const estadoCol = fila.querySelector(".estado")
    if (pedido.estado === "Pendiente") {
        estadoCol.classList.add("estado-pendiente")
    }else if (pedido.estado === "Entregado") {
        estadoCol.classList.add("estado-entregado")
    }else if (pedido.estado === "En reparto") {
        estadoCol.classList.add("estado-en-reparto")
    }else if (pedido.estado === "En preparación") {
        estadoCol.classList.add("estado-en-preparacion")
    }

    listaCorta.appendChild(fila)
  })
}