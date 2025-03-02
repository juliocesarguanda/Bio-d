
// Función para actualizar el analista de turno
async function analistaTurno() {
      await sendRequest('inicio/actualizarAnalista', {
        nombre: document.getElementById('analistaDeTurno').value
    }, resultado => {
        if (resultado.estatus === 'éxito') {
            showNotification('Analista agregado correctamente', 'success');
        } else {
            showNotification(resultado.respuesta, 'info');
        }
    });

    await consultarAnalista();
    
}
async function analistaTurno2() {
     await sendRequest('inicio/actualizarAnalista', {
        nombre: document.getElementById('analistaDeTurno2').value
    }, resultado => {
        if (resultado.estatus === 'éxito') {
            showNotification('Analista agregado correctamente', 'success');
        } else {
            showNotification(resultado.respuesta, 'info');
        }
    });

    await consultarAnalista();
    

}



// Función para consultar el analista del día
async function consultarAnalista() {
    await analistaTurnoconsultaSelec();
    await sendRequest('inicio/consultarAnalista', {}, resultado => {
        if (resultado.estatus === 'éxito') {
            document.getElementById('analistaDeTurno').value = resultado.respuesta
            document.getElementById('analistaDeTurno').classList.add('active');
            document.getElementById('analistaDeTurno2').value = resultado.respuesta
            document.getElementById('analistaDeTurno2').classList.add('active');
        } else {
            showNotification(resultado.respuesta, 'info');
        }
    });
}


// Función para consultar los analistas disponibles y seleccionar uno
async function analistaTurnoconsultaSelec() {
    await sendRequest('perfil/selecAnalista', {}, resultado => {
        if (resultado.estatus === 'éxito') {
            if (typeof resultado.respuesta === 'object') {
                document.getElementById('analistaDeTurno').innerHTML = "";
                document.getElementById('analistaDeTurno2').innerHTML = "";

                insertConten({ id: '', nombre: '' }, 'analistaDeTurno');
                insertConten({ id: '', nombre: '' }, 'analistaDeTurno2');
                resultado.respuesta.forEach(analista => {
                    if (analista.cargo === 1) {
                        insertConten({
                            id: analista.id,
                            nombre: `${analista.nombre} ${analista.apellido}`
                        }, 'analistaDeTurno');
                        insertConten({
                            id: analista.id,
                            nombre: `${analista.nombre} ${analista.apellido}`
                        }, 'analistaDeTurno2');
                    }
                });
            }
        } else {
            showNotification(resultado.respuesta, 'info');
        }
    });
}


// Llamar a la función para consultar el analista del día
consultarAnalista();
document.getElementById('analistaDeTurno')?.addEventListener('change', analistaTurno);
document.getElementById('analistaDeTurno2')?.addEventListener('change', analistaTurno2);
