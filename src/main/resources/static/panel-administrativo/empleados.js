const formEmpleado = document.getElementById("form-empleado");
const empleadosLista = document.getElementById("empleados-lista");
const empleadoMensaje = document.getElementById("empleado-mensaje");
const crearEmpleadoButton = document.getElementById("crear-empleado");
const selectorRol = document.getElementById("empleado-rol");

async function cargarRoles() {
    try {
        const response = await fetchConAuth("/admin/roles");
        if (!response.ok) {
            throw new Error(`No se pudieron cargar los perfiles (${response.status}).`);
        }
        const roles = await response.json();
        selectorRol.replaceChildren(new Option("Selecciona un perfil", ""));
        roles.forEach((rol) => {
            selectorRol.add(new Option(rol.titulo, rol.idRol));
        });
        crearEmpleadoButton.disabled = roles.length === 0;
        if (roles.length === 0) {
            mostrarMensajeEmpleado("No hay perfiles configurados.", true);
        }
    } catch (error) {
        selectorRol.replaceChildren(new Option("No se pudieron cargar los perfiles", ""));
        mostrarMensajeEmpleado(error.message, true);
    }
}

function mostrarMensajeEmpleado(mensaje, esError = false) {
    empleadoMensaje.textContent = mensaje;
    empleadoMensaje.className = esError ? "mt-3 mb-0 text-danger" : "mt-3 mb-0 text-success";
}

async function cargarEmpleados() {
    empleadosLista.innerHTML = '<tr><td colspan="4">Cargando empleados...</td></tr>';
    try {
        const response = await fetchConAuth("/api/v1/empleados");
        if (!response.ok) {
            throw new Error(`No se pudieron cargar los empleados (${response.status}).`);
        }

        const empleados = await response.json();
        if (empleados.length === 0) {
            empleadosLista.innerHTML = '<tr><td colspan="4">No hay empleados registrados.</td></tr>';
            return;
        }

        empleadosLista.replaceChildren(...empleados.map((empleado) => {
            const row = document.createElement("tr");
            const values = [
                empleado.nombre,
                empleado.correo,
                empleado.rol?.titulo || "Sin perfil",
                empleado.activo ? "Activo" : "Inactivo"
            ];
            values.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });
            return row;
        }));
    } catch (error) {
        empleadosLista.innerHTML = '<tr><td colspan="4">Error al cargar empleados.</td></tr>';
        mostrarMensajeEmpleado(error.message, true);
    }
}

formEmpleado.addEventListener("submit", async (event) => {
    event.preventDefault();
    empleadoMensaje.textContent = "";
    crearEmpleadoButton.disabled = true;

    const formData = new FormData(formEmpleado);
    const empleado = {
        nombre: formData.get("nombre").trim(),
        correo: formData.get("correo").trim(),
        contrasena: formData.get("contrasena"),
        activo: true,
        rol: { idRol: Number(formData.get("rol")) }
    };

    try {
        const response = await fetchConAuth("/api/v1/crear-empleado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(empleado)
        });

        if (response.status === 409) {
            throw new Error("Ya existe un empleado con ese correo.");
        }
        if (response.status === 401 || response.status === 403) {
            throw new Error("Solo un administrador puede dar de alta empleados.");
        }
        if (response.status === 400) {
            throw new Error("Revisa los datos; la contraseña debe tener al menos 8 caracteres.");
        }
        if (!response.ok) {
            throw new Error(`No se pudo crear el empleado (${response.status}).`);
        }

        formEmpleado.reset();
        mostrarMensajeEmpleado("Empleado creado correctamente.");
        await cargarEmpleados();
    } catch (error) {
        mostrarMensajeEmpleado(error.message, true);
    } finally {
        crearEmpleadoButton.disabled = false;
    }
});

document.getElementById("recargar-empleados").addEventListener("click", cargarEmpleados);
cargarRoles();
cargarEmpleados();
