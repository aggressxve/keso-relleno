const boton = document.getElementById("verCatalogo");
const estado = document.getElementById("estadoCatalogo");


boton.addEventListener("click", function () {
  estado.textContent = "Cargando catálogo...";
});

document.getElementById('team-tab').addEventListener('shown.bs.tab', () => {
  document.getElementById('cinta').classList.add('d-none');
  document.getElementById('tabContent').classList.remove('kesoHistory');
  document.getElementById('tabContent').classList.add('teamHistory');

});

document.getElementById('historia-tab').addEventListener('shown.bs.tab', () => {
  document.getElementById('cinta').classList.remove('d-none');
  document.getElementById('tabContent').classList.remove("teamHistory");
  document.getElementById('tabContent').classList.add("kesoHistory");
});

// Muestra la sección de equipo solo cuando la pestaña "Team JavaHots" está activa
document.addEventListener("DOMContentLoaded", () => {
  const teamTabButton = document.getElementById("team-tab");
  const historiaTabButton = document.getElementById("historia-tab");
  const equipoSection = document.getElementById("margin-cards");

  if (!teamTabButton || !equipoSection) return;

  // Cuando se muestra la pestaña "team", agregamos la clase para mostrar la sección
  teamTabButton.addEventListener("shown.bs.tab", () => {
    equipoSection.classList.add("mostrar-equipo");
  });

  // Cuando se muestra la pestaña "historia" (o cualquier otra), la ocultamos
  if (historiaTabButton) {
    historiaTabButton.addEventListener("shown.bs.tab", () => {
      equipoSection.classList.remove("mostrar-equipo");
    });
  }
});