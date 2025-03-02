document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.querySelector('.file-input');
  const selectedFile = document.getElementById('selectedFile');
  const fileName = document.getElementById('fileName');
  const importBtn = document.getElementById('importBtn');
  const exportBtn = document.getElementById('exportBtn');

  // Manejo de selección de archivo
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.sql')) {
        showSelectedFile(file);
      } else {
        showError('Por favor, seleccione un archivo .sql válido');
      }
    }
  });

  // Manejo de arrastrar y soltar
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.sql')) {
        fileInput.files = e.dataTransfer.files;
        showSelectedFile(file);
      } else {
        showError('Por favor, seleccione un archivo .sql válido');
      }
    }
  });



  function showSelectedFile(file) {
    fileName.textContent = file.name;
    selectedFile.style.display = 'block';
    importBtn.disabled = false;
  }

  exportBtn.addEventListener('click', async () => {
    exportBtn.disabled = true;

    try {
      sendRequest('configuracion/exportarSql', {}, response => {
      if (response.estatus === 'exito') {
            const sqlData =  response.respuesta;

          
            // Crear enlace para descargar el archivo
            const link = document.createElement('a');
            link.href = 'data:application/sql;charset=utf-8,' + encodeURIComponent(sqlData);
            link.download = `bio_diagno_salud_${new Date().toISOString().slice(0, 10)}.sql`;
            link.click();

            showNotification('Base de datos exportada exitosamente', 'success');
        } else {
            showNotification(response.respuesta, 'info');
        }  
      });
       
        
    } catch (error) {
        console.error('Error al exportar:', error);
        showNotification('Error al exportar la base de datos', 'error');
    } finally {
        exportBtn.disabled = false;
    }
});


importBtn.addEventListener('click', async () => {
  try {
      const file = fileInput.files[0];

      if (!file) {
          showNotification('Por favor, selecciona un archivo SQL', 'info');
          return;
      }

      const reader = new FileReader();

      reader.onload = async function (e) {
          selectedFile.style.display = 'none';
          importBtn.disabled = true;

          const sql = e.target.result;

          try {
            sendRequest('configuracion/importarSql', {sql}, response => {
              if (response.estatus === 'exito') {
                  showNotification('Base de datos importada exitosamente', 'success');
                  setTimeout(() => { window.location.href = "index.html"; }, 2000);
              } else {
                  showNotification(response.respuesta, 'info');
              }});
          } catch (error) {
              console.error('Error al importar:', error);
              showNotification('Error al importar la base de datos', 'error');
          } finally {
              importBtn.disabled = false;
          }
      };

      reader.readAsText(file);
  } catch (error) {
      console.error('Error general:', error);
      showNotification('Error al importar la base de datos', 'error');
  }
});


 

});