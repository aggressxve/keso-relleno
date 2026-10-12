(() => {
    const loginUrl = "/panel-administrativo/login-admin.html";

    function cerrarSesion() {
        sessionStorage.removeItem("empleadoActual");
        window.location.replace(loginUrl);
    }

    window.fetchConAuth = async (input, options = {}) => {
        const requestUrl = new URL(
            input instanceof Request ? input.url : input,
            window.location.href
        );
        const headers = new Headers(
            options.headers || (input instanceof Request ? input.headers : undefined)
        );
        const response = await fetch(input, { ...options, headers, credentials: "same-origin" });
        if (response.status === 401 && requestUrl.origin === window.location.origin) {
            cerrarSesion();
        }
        return response;
    };

    window.fetchConAuth("/auth/admin/me")
        .then(async (response) => {
            if (!response.ok) {
                cerrarSesion();
                return;
            }
            window.empleadoActual = await response.json();
            sessionStorage.setItem("empleadoActual", JSON.stringify(window.empleadoActual));
            window.dispatchEvent(new CustomEvent("empleadoAutenticado"));
        })
        .catch(cerrarSesion);
})();
