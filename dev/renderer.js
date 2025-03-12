document.addEventListener('DOMContentLoaded', async () => {
    // Controladores de eventos
    document.getElementById('minimize').addEventListener('click', () => window.electronAPI.minimize());
    document.getElementById('maximize').addEventListener('click', () => window.electronAPI.maximize());
    document.getElementById('close').addEventListener('click', showExitModal);
    
    // Configuración de zoom
    let currentZoom = await window.electronAPI.getInitialZoom();
    updateZoomLevel(currentZoom);
    
    // Listeners de actualizaciones
    window.electronAPI.onUpdateStatus((message) => {
      // Manejar notificación de actualización
    });
    
    window.electronAPI.onUpdateReady((version) => {
      // Manejar actualización lista
    });
  });
  
  function updateZoomLevel(zoomFactor) {
    // Lógica de zoom...
  } 