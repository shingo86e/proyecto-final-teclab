// Reproduce sonido de click en todos los botones
document.addEventListener('DOMContentLoaded', function() {
  const clickAudio = new Audio('sonidos/click.mp3');
  clickAudio.volume = 0.05; // Volumen bajo (0 = silencio, 1 = máximo)

  // Estado global de mute, persistente entre páginas
  window.sonidoMute = localStorage.getItem('sonidoMute') === 'true';

  // Actualiza el icono si existe el botón mute
  function actualizarIconoMute() {
      const icon = document.getElementById('muteIcon');
      const cross = icon ? icon.querySelector('#muteCross') : null;
      if (icon) {
        icon.setAttribute('fill', window.sonidoMute ? '#f44336' : '#fff');
        if (cross) {
          cross.style.display = window.sonidoMute ? 'inline' : 'none';
        }
      }
  }
  actualizarIconoMute();

  // Escucha el botón mute si existe
  const muteBtn = document.getElementById('muteBtn');
  if (muteBtn) {
    muteBtn.addEventListener('click', function() {
      window.sonidoMute = !window.sonidoMute;
      localStorage.setItem('sonidoMute', window.sonidoMute);
      actualizarIconoMute();
    });
  }

  document.body.addEventListener('click', function(e) {
    // Sonido para botones y enlaces <a>
    let isButton = e.target.tagName === 'BUTTON' || e.target.closest('button');
    let link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
    if (isButton) {
      if (!window.sonidoMute) {
        clickAudio.currentTime = 0;
        clickAudio.play();
      }
    } else if (link && link.href && !link.target && link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
      // Prevenir navegación inmediata para escuchar el sonido
      e.preventDefault();
      if (!window.sonidoMute) {
        clickAudio.currentTime = 0;
        clickAudio.play();
        setTimeout(function() {
          window.location.href = link.href;
        }, 120); // 120ms para que suene el click
      } else {
        window.location.href = link.href;
      }
    }
  }, true);
});