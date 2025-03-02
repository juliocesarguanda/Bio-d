function inputParametros() {
    sendRequest('configuracion/consultarParametros', {}, response => {
        if (typeof response.respuesta === 'object') {
            document.getElementById('formularioParametrosNumeroFactura').value = response.respuesta.factura;
            document.getElementById('formularioParametrosNumeroFactura').className = 'active';

            document.getElementById('formularioParametrosPrecioDolar').value = response.respuesta.dolar;
            document.getElementById('formularioParametrosPrecioDolar').className = 'active';
        } else {
                showNotification(response.respuesta, 'info');
        }
    }, 'GET').catch(error => {
        showNotification(error.respuesta, 'info');
    });
}


function inputParametrosWhatsAppAp() {
    sendRequest('configuracion/consultarParametrosWhatsAppAp', {}, response => {
        
            if(response.respuesta.token != ''){
            document.getElementById('formularioParametrosToken').value = response.respuesta.token;
            document.getElementById('formularioParametrosToken').className = 'active';
                
            }
            if(response.respuesta.instanceId != ''){
                
            document.getElementById('formularioParametrosInstanceId').value = response.respuesta.instanceId;
            document.getElementById('formularioParametrosInstanceId').className = 'active';
            }

    }, 'GET').catch(error => {
        
        showNotification(error.respuesta, 'info');
    });
}

document.getElementById('configuracion').addEventListener('click', () => {
    inputParametrosWhatsAppAp();
    inputParametros();
});