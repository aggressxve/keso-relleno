// confetti.js
// Lanza emojis de pastel al hacer click en el botón "X pasteles".
// Sin canvas, sin librerías: solo elementos <span> con animación CSS.

(function () {

  const boton = document.getElementById("pastel-ventas");

  // GUARD: si el botón no existe en esta página, no hacemos nada.
  if (!boton) {
    return;
  }

  const EMOJIS = ["🎂", "🧁", "🍰", "🍩"];
  const CANTIDAD = 16;

  boton.addEventListener("click", () => {
    const rect = boton.getBoundingClientRect();

    for (let i = 0; i < CANTIDAD; i++) {
      const emoji = document.createElement("span");
      emoji.className = "confetti-emoji";
      emoji.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

      // Posición inicial: centro del botón
      emoji.style.left = `${rect.left + rect.width / 2}px`;
      emoji.style.top = `${rect.top}px`;

      // Variación aleatoria de dirección, distancia y duración
      const anguloGrados = Math.random() * 360;
      const distancia = 80 + Math.random() * 120;
      const dx = Math.cos((anguloGrados * Math.PI) / 180) * distancia;
      const dy = Math.sin((anguloGrados * Math.PI) / 180) * distancia - 100; // sesgo hacia arriba

      emoji.style.setProperty("--dx", `${dx}px`);
      emoji.style.setProperty("--dy", `${dy}px`);
      emoji.style.fontSize = `${16 + Math.random() * 14}px`;
      emoji.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;

      document.body.appendChild(emoji);

      // Se elimina del DOM cuando termina su animación
      emoji.addEventListener("animationend", () => emoji.remove());
    }
  });

})();