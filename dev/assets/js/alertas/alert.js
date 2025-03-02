const contenedorText = document.querySelector(".alert-bar-text");
const container = document.querySelector(".alert-bar");

consultarAlertas();
consultarAlertasMiscelaneos();

async function consultarAlertas() {
    sendRequest('alerta/alertas', {}, reactivos => {
        contenedorText.innerHTML = "";
        let reactivosFanta = [];

        for (let index = 0; index < reactivos.length; index++) {
            if ((reactivos[index].disponible >= 1) && (reactivos[index].disponible <= 5)) {
                reactivosFanta.push(`Reactivo ${reactivos[index].nombreReactivo} en agotamiento. Restante: ${reactivos[index].disponible} pacientes`);
            }

            if ((reactivos[index].disponible === 0) || (reactivos[index].estatusReactivo === 0)) {
                reactivosFanta.push(`Reactivo del Análisis ${reactivos[index].analisis} se agotó en su totalidad o fue eliminado`);
            }
        }

        container.style.display = "none";
        if (reactivosFanta.length > 0) {
            reactivosFantan(reactivosFanta);
        }
    }, 'GET').catch(error => {
        showNotification('Error: ' + error.respuesta, 'info');
    });
}

async function consultarAlertasMiscelaneos() {
    sendRequest('alerta/alertasMiscelaneos', {}, miscelaneos => {
        contenedorText.innerHTML = "";
        let miscelaneosFanta = [];

        for (let index = 0; index < miscelaneos.length; index++) {
            if ((miscelaneos[index].miscelaneoCantidad >= 1) && (miscelaneos[index].miscelaneoCantidad <= 5)) {
                miscelaneosFanta.push(`Misceláneo ${miscelaneos[index].miscelaneoNombre} en agotamiento. Restante: ${miscelaneos[index].miscelaneoCantidad}`);
            }

            if ((miscelaneos[index].miscelaneoCantidad === 0)) {
                miscelaneosFanta.push(`Misceláneo ${miscelaneos[index].miscelaneoNombre} se agotó en su totalidad.`);
            }
        }

        container.style.display = "none";
        if (miscelaneosFanta.length > 0) {
            reactivosFantan(miscelaneosFanta);
        }
    }, 'GET').catch(error => {
        showNotification('Error: ' + error.respuesta, 'info');
    });
}

function reactivosFantan(v) {
    container.style.display = "flex";
    contenedorText.innerHTML = '';
    for (let index = 0; index < v.length; index++) {
        let strong = document.createElement("strong");
        strong.innerHTML = " " + " | " + v[index];
        contenedorText.appendChild(strong);
    }
}
