const formEmpleado = document.getElementById("form-empleado");
const empleadosLista = document.getElementById("empleados-lista");
const empleadoMensaje = document.getElementById("empleado-mensaje");
const crearEmpleadoButton = document.getElementById("crear-empleado");
const selectorRol = document.getElementById("empleado-rol");
const modalEditarEmpleado = new bootstrap.Modal(document.getElementById("modal-editar-empleado"));
const formEditarEmpleado = document.getElementById("form-editar-empleado");
const mensajeEditarEmpleado = document.getElementById("editar-empleado-mensaje");
const guardarEmpleadoButton = document.getElementById("guardar-empleado");

function mostrarMensajeEmpleado(mensaje, esError = false) {
    empleadoMensaje.textContent = mensaje;
    empleadoMensaje.className = esError ? "mt-3 mb-0 text-danger" : "mt-3 mb-0 text-success";
}

async function cargarRoles() {
    try {
        const response = await fetchConAuth("/admin/roles");
        if (!response.ok) {
            throw new Error(`No se pudieron cargar los perfiles (${response.status}).`);
        }

        const roles = await response.json();
        const selectorEdicion = document.getElementById("editar-empleado-rol");
        selectorRol.replaceChildren(new Option("Selecciona un perfil", ""));
        selectorEdicion.replaceChildren();
        roles.forEach((rol) => {
            selectorRol.add(new Option(rol.titulo, rol.idRol));
            selectorEdicion.add(new Option(rol.titulo, rol.idRol));
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

async function cargarEmpleados() {
    empleadosLista.innerHTML = '<tr><td colspan="5">Cargando empleados...</td></tr>';
    try {
        const response = await fetchConAuth("/api/v1/empleados");
        if (!response.ok) {
            throw new Error(`No se pudieron cargar los empleados (${response.status}).`);
        }

        const empleados = await response.json();
        if (empleados.length === 0) {
            empleadosLista.innerHTML = '<tr><td colspan="5">No hay empleados registrados.</td></tr>';
            return;
        }

        const actual = window.empleadoActual
            || JSON.parse(sessionStorage.getItem("empleadoActual") || "null");
        empleadosLista.replaceChildren(...empleados.map((empleado) => {
            const row = document.createElement("tr");
            row.dataset.idEmpleado = empleado.idEmpleado;
            [
                empleado.nombre,
                empleado.correo,
                empleado.rol?.titulo || "Sin perfil"
            ].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });

            const estadoCell = document.createElement("td");
            const pill = document.createElement("span");
            pill.className = "estado-empleado " +
                (empleado.activo ? "estado-empleado--activo" : "estado-empleado--inactivo");
            pill.textContent = empleado.activo ? "Activo" : "Inactivo";
            estadoCell.appendChild(pill);
            row.appendChild(estadoCell);

            const actions = document.createElement("td");
            const editButton = document.createElement("button");
            editButton.className = "btn btn-sm btn-outline-primary me-2";
            editButton.dataset.action = "edit";
            editButton.textContent = "Editar";
            actions.appendChild(editButton);

            if (empleado.activo) {
                const deactivateButton = document.createElement("button");
                deactivateButton.className = "btn btn-sm btn-outline-danger";
                deactivateButton.dataset.action = "deactivate";
                deactivateButton.textContent = "Desactivar";
                deactivateButton.disabled = empleado.correo === actual?.correo;
                if (deactivateButton.disabled) {
                    deactivateButton.title = "No puedes desactivar tu propia cuenta";
                }
                actions.appendChild(deactivateButton);
            }
            row.appendChild(actions);
            return row;
        }));
    } catch (error) {
        empleadosLista.innerHTML = '<tr><td colspan="5">Error al cargar empleados.</td></tr>';
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
        rol: { idRol: Number(formData.get("rol")) }
    };

    try {
        const response = await fetchConAuth("/api/v1/crear-empleado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(empleado)
        });
        const responseData = await response.json().catch(() => ({}));

        if (response.status === 409) {
            throw new Error(responseData.error || "Ya existe un empleado con ese correo.");
        }
        if (response.status === 401 || response.status === 403) {
            throw new Error("Solo un administrador puede dar de alta empleados.");
        }
        if (response.status === 400) {
            throw new Error(responseData.error
                || "Revisa que el correo, perfil y contraseña sean válidos.");
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
        crearEmpleadoButton.disabled = selectorRol.options.length <= 1;
    }
});

empleadosLista.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const row = button.closest("tr");
    const empleadoId = row.dataset.idEmpleado;
    if (button.dataset.action === "edit") {
        try {
            const response = await fetchConAuth(`/api/v1/empleado/${empleadoId}`);
            if (!response.ok) {
                throw new Error(`No se pudo cargar el empleado (${response.status}).`);
            }

            const empleado = await response.json();
            document.getElementById("editar-empleado-id").value = empleado.idEmpleado;
            document.getElementById("editar-empleado-nombre").value = empleado.nombre;
            document.getElementById("editar-empleado-correo").value = empleado.correo;
            document.getElementById("editar-empleado-rol").value = empleado.rol?.idRol ?? "";
            document.getElementById("editar-empleado-activo").checked = Boolean(empleado.activo);
            document.getElementById("editar-empleado-contrasena").value = "";
            mensajeEditarEmpleado.textContent = "";
            modalEditarEmpleado.show();
        } catch (error) {
            mostrarMensajeEmpleado(error.message, true);
        }
        return;
    }

    if (button.dataset.action === "deactivate"
            && window.confirm("¿Desactivar a este empleado? Su registro se conservará.")) {
        button.disabled = true;
        try {
            const response = await fetchConAuth(`/api/v1/eliminar-empleado/${empleadoId}`, {
                method: "DELETE"
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || `No se pudo desactivar el empleado (${response.status}).`);
            }
            mostrarMensajeEmpleado("Empleado desactivado.");
            await cargarEmpleados();
        } catch (error) {
            mostrarMensajeEmpleado(error.message, true);
            button.disabled = false;
        }
    }
});

formEditarEmpleado.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensajeEditarEmpleado.textContent = "";
    guardarEmpleadoButton.disabled = true;

    const empleadoId = document.getElementById("editar-empleado-id").value;
    const contrasena = document.getElementById("editar-empleado-contrasena").value;
    const empleado = {
        nombre: document.getElementById("editar-empleado-nombre").value.trim(),
        correo: document.getElementById("editar-empleado-correo").value.trim(),
        idRol: Number(document.getElementById("editar-empleado-rol").value),
        activo: document.getElementById("editar-empleado-activo").checked,
        contrasena: contrasena || null
    };

    try {
        const response = await fetchConAuth(`/api/v1/editar-empleado/${empleadoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(empleado)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || `No se pudieron guardar los cambios (${response.status}).`);
        }
        modalEditarEmpleado.hide();
        mostrarMensajeEmpleado("Cambios guardados.");
        await cargarEmpleados();
    } catch (error) {
        mensajeEditarEmpleado.textContent = error.message;
        mensajeEditarEmpleado.className = "mt-3 mb-0 text-danger";
    } finally {
        guardarEmpleadoButton.disabled = false;
    }
});

document.getElementById("recargar-empleados").addEventListener("click", cargarEmpleados);
cargarRoles();
cargarEmpleados();


// ---------- Ojito para ver la contraseña ----------
const ICONO_OJO = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const ICONO_OJO_TACHADO = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

function agregarOjito(input) {
    if (!input || input.parentElement.classList.contains("password-wrapper")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "password-wrapper";
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "toggle-password";
    boton.setAttribute("aria-label", "Mostrar contraseña");
    boton.innerHTML = ICONO_OJO;
    boton.addEventListener("click", () => {
        const oculto = input.type === "password";
        input.type = oculto ? "text" : "password";
        boton.innerHTML = oculto ? ICONO_OJO_TACHADO : ICONO_OJO;
        boton.setAttribute("aria-label", oculto ? "Ocultar contraseña" : "Mostrar contraseña");
    });
    wrapper.appendChild(boton);

    // Al cerrar el modal o limpiar el formulario, vuelve a ocultarse
    const ocultar = () => {
        input.type = "password";
        boton.innerHTML = ICONO_OJO;
        boton.setAttribute("aria-label", "Mostrar contraseña");
    };
    input.form?.addEventListener("reset", ocultar);
    document.getElementById("modal-editar-empleado")
        ?.addEventListener("hidden.bs.modal", ocultar);
}

document
    .querySelectorAll("#form-empleado input[type='password'], #form-editar-empleado input[type='password']")
    .forEach(agregarOjito);