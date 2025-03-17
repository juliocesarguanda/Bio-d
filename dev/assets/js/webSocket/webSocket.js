const port = window.location.port || (window.location.protocol === 'https:' ? 443 : 80);
let socketId;
const socket = io(`ws://${window.location.hostname}:${port}`, {
    path: "/socket.io/",
    transports: ['websocket'],
    reconnectionDelay: 1000,
    auth: {
        token: "cliente-electron"
    }
});
function checkUserSession(socketId) {
    sendRequest('login/session', { id: socketId }, resultado => {
        if (resultado.estatus === 'éxito') {
            const usuario = resultado.respuesta.usuario;
            const tipoUsuario = resultado.respuesta.tipo;

            if (!usuario || !tipoUsuario) {
                window.location.href = "index.html";
            } else if (tipoUsuario != 1) {
                const elementos = document.querySelectorAll(".admin");
                elementos.forEach(elemento => { elemento.style.display = "none"; });
            }

            document.querySelector('.user-dropdown-header').innerHTML = usuario;
            document.querySelector('.user-circle').innerHTML = usuario[0];
        } else {
            window.location.href = "index.html";
        }
    });
}
socket.on('connect', () => {
    socketId = socket.id;
    checkUserSession(socketId);
});

socket.on('disconnect', () => {
    window.location.href = "index.html";
});


socket.on('message', (socketData) => {

    console.table(socketData)
    console.log(socketId);

    if (socketData.codigo == '0001') {
        sendRequest('login/session', { id: socketId }, resultado => {
            if (resultado.estatus === 'éxito') {
                const tipoUsuario = resultado.respuesta.tipo;
                if (socketData.tipo != 1 || tipoUsuario == 1) {
                    showNotification('El usuario ' + socketData.usuario + ' a iniciado seción', 'info');
                }
            }
        });
    } else if (socketData.socketId != socketId) {
        if (socketData.codigo == '0002') {
            consultarAlertasMiscelaneos();
            showNotification('Nuevo Miscelaneo', 'info');
            if (verificarClasePorId('miscelaneo_inventario', 'selected')) {
                tablaMiscelaneo();
            } if (verificarClasePorId('registrarAnalisisModal', 'show') || verificarClasePorId('analisisEditModal', 'show')) {
                selectDeMiscelaneos2('configuracion/consultMiscelaneo', 'modalTableBodyMiscelaneos', 'consultar', 'checkM', false);
            }
        } else if (socketData.codigo == '0003') {
            consultarAlertas();
            showNotification('Nuevo Reactivo', 'info');
            if (verificarClasePorId('reactivo_inventario', 'selected')) {
                tablaReactivo();
            } if (verificarClasePorId('registrarAnalisisModal', 'show') || verificarClasePorId('analisisEditModal', 'show')) {
                selectDeReactivos();
            }
        } else if (socketData.codigo == '0004') {
            consultarAlertasMiscelaneos();
            showNotification('Miscelaneo nuevo lote', 'info');
            if (verificarClasePorId('miscelaneo_inventario', 'selected')) {
                tablaMiscelaneo();
            } if (verificarClasePorId('registrarAnalisisModal', 'show') || verificarClasePorId('analisisEditModal', 'show')) {
                selectDeMiscelaneos2('configuracion/consultMiscelaneo', 'modalTableBodyMiscelaneos', 'consultar', 'checkM', false);
            } if (idValue('valorEditarMiscelaneoId',socketData.id) && verificarClasePorId('miscelaneoEditModal', 'show')) {
                modalClose('miscelaneoEditModal')
            } 
        } else if (socketData.codigo == '0005') {
            consultarAlertas();
            showNotification('Reactivo nuevo lote', 'info');
            if (verificarClasePorId('reactivo_inventario', 'selected')) {
                tablaReactivo();
            } if (verificarClasePorId('registrarAnalisisModal', 'show') || verificarClasePorId('analisisEditModal', 'show')) {
                selectDeReactivos();
            } if (idValue('valorEditarReactivoId',socketData.id) && verificarClasePorId('reactivoEditModal', 'show')) {
                modalClose('reactivoEditModal')
            } 

        } else if (socketData.codigo == '0006' || socketData.codigo == '0008') {
            consultarAlertas();
            showNotification('Reactivo eliminado', 'info');
            if (verificarClasePorId('reactivo_inventario', 'selected')) {
                tablaReactivo();
            } if (verificarClasePorId('registrarAnalisisModal', 'show') || verificarClasePorId('analisisEditModal', 'show')) {
                selectDeReactivos();
            } if (idValue('valorEditarReactivoId',socketData.id) && verificarClasePorId('reactivoEditModal', 'show')) {
                modalClose('reactivoEditModal')
            } 
        } else if (socketData.codigo == '0007' || socketData.codigo == '0009') {
            consultarAlertasMiscelaneos();
            showNotification('Miscelaneo eliminado', 'info');
            if (verificarClasePorId('miscelaneo_inventario', 'selected')) {
                tablaMiscelaneo();
            } if (verificarClasePorId('registrarAnalisisModal', 'show') || verificarClasePorId('analisisEditModal', 'show')) {
                selectDeMiscelaneos2('configuracion/consultMiscelaneo', 'modalTableBodyMiscelaneos', 'consultar', 'checkM', false);
            } if (idValue('valorEditarMiscelaneoId',socketData.id) && verificarClasePorId('miscelaneoEditModal', 'show')) {
                modalClose('miscelaneoEditModal')
            } 
        } else if (socketData.codigo == '0010') {
            consultarAnalista();
            showNotification('Se actualizo analista de turno', 'info');
        } else if (socketData.codigo == '0011') {
            consultarFeriados();
            showNotification('Se actualizo día feriado', 'info');
        } else if (socketData.codigo == '0012') {
            showNotification('Nuevo paciente Registrado', 'info');
            if (verificarClasePorId('pacienteConsultar', 'selected')) {
                tablaPaciente();
            }
        } else if (socketData.codigo == '0013') {
            showNotification('Paciente Actualizado', 'info');
            if (verificarClasePorId('pacienteConsultar', 'selected')) {
                tablaPaciente();
            } if(idValue('idUpdate',socketData.id) && verificarClasePorId('updatePacientesModal', 'show')){
                tablaPaciente();
                modalClose('updatePacientesModal')
            }
        } else if (socketData.codigo == '0014') {
            showNotification('Paciente eliminado', 'info');
            if (verificarClasePorId('pacienteConsultar', 'selected')) {
                tablaPaciente();
            } if(idValue('idUpdate',socketData.id) && verificarClasePorId('pacienteDeleteModal', 'show')){
                tablaPaciente();
                modalClose('pacienteDeleteModal')
            } if(idValue('idUpdate',socketData.id) && verificarClasePorId('updatePacientesModal', 'show')){
                tablaPaciente();
                modalClose('updatePacientesModal')
            }
        } else if (socketData.codigo == '0015') {
            showNotification('Nuevo examen pendiente', 'info');
            if (verificarClasePorId('pacientePendiente', 'selected')) {
                tablaPendientes();
            }

        } else if (socketData.codigo == '0016') {
            showNotification('Un examen procesado', 'info');
            if (verificarClasePorId('pacientePendiente', 'selected')) {
                tablaPendientes();
            } if (idValue('idPacienteResultadRemitida',socketData.id) && verificarClasePorId('resultadoPacientesModal', 'show')) {
                modalClose('resultadoPacientesModal')
            }
        } else if (socketData.codigo == '0017') {
            showNotification('Miscelaneo eliminado', 'info');
        } else if (socketData.codigo == '0018') {
            showNotification('Miscelaneo eliminado', 'info');
        } else if (socketData.codigo == '0019') {
            showNotification('Miscelaneo eliminado', 'info');
        } else if (socketData.codigo == '0020') {
            showNotification('Miscelaneo eliminado', 'info');
        } else if (socketData.codigo == '0021') {

        }
    }

});