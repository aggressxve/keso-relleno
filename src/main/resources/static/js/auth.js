const AUTH_KEY = "keso_token";
const USER_KEY = "usuarioSesion";

function guardarSesion(token, usuario) {
    localStorage.setItem(AUTH_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

function obtenerToken() {
    return localStorage.getItem(AUTH_KEY);
}

function cerrarSesion() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
}

// Revisa que exista el token y que no haya expirado
function tokenVigente() {
    const token = obtenerToken();
    if (!token) return false;
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        return payload.exp * 1000 > Date.now();
    } catch (e) {
        return false;
    }
}