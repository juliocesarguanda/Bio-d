// Función para consultar feriados
function consultarFeriados() {
    sendRequest('inicio/consultarFeriado', {}, response => {
        if (response.estatus === 'éxito') {
            document.getElementById('classCkIdvalue').checked = response.respuesta;
            document.getElementById('classCkIdvalue2').checked = response.respuesta;
        } else {
            showNotification('info: ' + response.respuesta);
        }
    }, 'GET').catch(error => {
        showNotification('info: ' + error.respuesta);
    });
}

// Llamar a la función para consultar feriados
consultarFeriados();
