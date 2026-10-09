document.addEventListener("DOMContentLoaded", () => {
    const zona = document.getElementById("dropzone");
    const input = document.getElementById("imagenProducto");
    const preview = document.getElementById("dropzone-preview");
    const texto = zona.querySelector(".dropzone-hint");
    const error = document.getElementById("dropzone-error");
    const MAX_MB = 5;


    function mostrarError(msg) {
        error.textContent = msg;
        error.classList.remove("d-none");
    }

    function validar(file) {
        error.classList.add("d-none");
        if (!file) return false;
        if (!file.type.startsWith("image/")) {
            mostrarError("El archivo debe ser una imagen (JPG, PNG, WEBP...).");
            return false;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
            mostrarError("La imagen no puede pesar más de " + MAX_MB + " MB.");
            return false;
        }
        return true;
    }

    function mostrarVista(file) {
        preview.src = URL.createObjectURL(file);
        preview.classList.remove("d-none");
        texto.textContent = file.name;
    }

    ["dragenter", "dragover"].forEach((ev) =>
        zona.addEventListener(ev, (e) => {
            e.preventDefault();
            zona.classList.add("dragover");
        })
    );
    ["dragleave", "drop"].forEach((ev) =>
        zona.addEventListener(ev, (e) => {
            e.preventDefault();
            zona.classList.remove("dragover");
        })
    );

    zona.addEventListener("drop", (e) => {
        const file = e.dataTransfer.files[0];
        if (!validar(file)) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        mostrarVista(file);
    });

    input.addEventListener("change", () => {
        const file = input.files[0];
        if (validar(file)) mostrarVista(file);
    });

    // Evita que el navegador abra la imagen si la sueltan fuera de la zona
    ["dragover", "drop"].forEach((ev) =>
        window.addEventListener(ev, (e) => e.preventDefault())
    );
});