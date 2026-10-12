function llamarPanel() {
    document.querySelector('.main-content').insertAdjacentHTML('beforebegin', `
        <input type="checkbox" id="menu-toggle" class="menu-checkbox">
        <label for="menu-toggle" class="menu-toggle">
            <span>&#9776;</span>
        </label>

        <aside class="sidebar" id="sidebar">
            <h2 id="PO">Panel Opciones</h2>
            <img src="/images/logo.jpeg" alt="Keso">
            <p class="sidebar-employee" id="sidebar-employee" aria-live="polite"></p>
            <nav id="slideA" class="sidebar-nav">
                <a href="vistaGeneral.html">Inicio</a>
                <a href="pedidos.html">Pedidos</a>
                <a href="clientes.html">Clientes</a>
                <a href="productos.html">Productos</a>
                <a href="panelP.html">Nuevo Producto</a>
                <a id="empleados-link" href="empleados.html" hidden>Empleados</a>
                <a id="salir" href="/panel-administrativo/login-admin.html">⮐ Salir</a>
            </nav>
        </aside>
    `);

    function mostrarEmpleado() {
        const empleado = window.empleadoActual
            || JSON.parse(sessionStorage.getItem("empleadoActual") || "null");
        const elemento = document.getElementById("sidebar-employee");
        if (empleado && elemento) {
            elemento.textContent = empleado.nombre || empleado.correo;
        }
        const empleadosLink = document.getElementById("empleados-link");
        if (empleadosLink) {
            empleadosLink.hidden = empleado?.rol?.toUpperCase() !== "ADMIN";
        }
    }

    mostrarEmpleado();
    window.addEventListener("empleadoAutenticado", mostrarEmpleado);
    document.getElementById("salir").addEventListener("click", async (event) => {
        event.preventDefault();
        sessionStorage.removeItem("empleadoActual");
        try {
            await fetch("/auth/admin/logout", {
                method: "POST",
                credentials: "same-origin"
            });
        } catch (error) {
            console.error("No se pudo cerrar la sesión en el servidor:", error);
        } finally {
            window.location.replace("/panel-administrativo/login-admin.html");
        }
    });
}