function llamarPanel() {
    document.querySelector('.main-content').insertAdjacentHTML('beforebegin', `
        <input type="checkbox" id="menu-toggle" class="menu-checkbox">
        <label for="menu-toggle" class="menu-toggle">
            <span>&#9776;</span>
        </label>

        <aside class="sidebar" id="sidebar">
            <h2 id="PO">Panel Opciones</h2>
            <img src="/images/logo.jpeg">
            <nav id="slideA" class="sidebar-nav">
                <a href="vistaGeneral.html">Inicio</a>
                <a href="pedidos.html">Pedidos</a>
                <a href="clientes.html">Clientes</a>
                <a href="productos.html">Productos</a>
                <a href="panelP.html">Nuevo Producto</a>
                <a id="salir" href="/index.html">⮐ Salir</a>
            </nav>
        </aside>
    `);
}