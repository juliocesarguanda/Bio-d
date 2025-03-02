const ws = new WebSocket(`ws://${window.location.hostname}:7667`);
ws.onclose = (event) => {
    if (event.code === 1006) {
        fetch('src/servicios/WebSocket/server_WebSocket.php', {
            method: 'POST',
            body: JSON.stringify({ data: 'WebSocket' }), // Assuming data needs to be JSON
        })
            .then((response) => {
                if (response.ok) {
                    location.reload();
                } else {
                    console.error('Failed server WebSocket:', response.statusText);
                }
            })
            .catch((error) => {
                console.error('Error server WebSocket:', error);
            });
    }
};



ws.onmessage = (event) => {
    let onmessage = event.data.split('#');
    let local = window.location.pathname.split('/').pop();

    // un usuario a iniciado cesión
    if (onmessage[0] == '0001') {
      
            const params = [{
                title: 'El usuario ' + onmessage[1] + ' a iniciado cesión'
                },
                'info',
                {
                animate: true,
                isColored: true,
                screenTime: '15000',
                transitionDuration: '500',
                position: 'bottom-right',
                typeAnimation: 'fade-in',
                expand: false,
                theme: 'gradient',
                timeline: true,
                removeOn: 'click'
                }]
                const bell = new Bell(...params)
                bell.launch()
    }

    else if ((local == 'inventario.php') && (userActive != onmessage[1])) {
        // actualizarMiscelaneo o eliminarMiscelaneo
        if (((onmessage[0] == '0002') || (onmessage[0] == '0004')) && (((document.getElementById('valorEditarMiscelaneoId').value == onmessage[2]) && (document.getElementById('modalMiscelaneoEditar').checked == true)) || ((document.getElementById('valorEliminarMiscelaneoId').value == onmessage[2]) && (document.getElementById('modalMiscelaneoEliminar').checked == true)))) {
            tablaMiscelanio();
            document.getElementById('modalMiscelaneoEditar').checked = false;
            document.getElementById('modalMiscelaneoEliminar').checked = false;
           
                const params = [{
                    title: "Otro usuario modifico " + onmessage[3]
                    },
                    'info',
                    {
                    animate: true,
                    isColored: true,
                    screenTime: '15000',
                    transitionDuration: '500',
                    position: 'bottom-right',
                    typeAnimation: 'fade-in',
                    expand: false,
                    theme: 'gradient',
                    timeline: true,
                    removeOn: 'click'
                    }]
                    const bell = new Bell(...params)
                    bell.launch()
        }
        // registrarMiscelaneos
        else if (onmessage[0] == '0003') {
            tablaMiscelanio();
            
                const params = [{
                    title: "Nuevo Miscelaneo"
                    },
                    'info',
                    {
                    animate: true,
                    isColored: true,
                    screenTime: '15000',
                    transitionDuration: '500',
                    position: 'bottom-right',
                    typeAnimation: 'fade-in',
                    expand: false,
                    theme: 'gradient',
                    timeline: true,
                    removeOn: 'click'
                    }]
                    const bell = new Bell(...params)
                    bell.launch()

        }


        // actualizarReactivo o eliminarReactivo 
        if (((onmessage[0] == '0005') || (onmessage[0] == '0007')) && (((document.getElementById('valorEditarReactivoId').value == onmessage[2]) && (document.getElementById('modalReactivosEditar').checked == true)) || ((document.getElementById('valorEliminarReactivoId').value == onmessage[2]) && (document.getElementById('modalReactivoEliminar').checked == true)))) {
            tablaReactivo();
            document.getElementById('modalReactivosEditar').checked = false;
            document.getElementById('modalReactivoEliminar').checked = false;

                const params = [{
                    title: "Otro usuario modifico " + onmessage[3]
                    },
                    'info',
                    {
                    animate: true,
                    isColored: true,
                    screenTime: '15000',
                    transitionDuration: '500',
                    position: 'bottom-right',
                    typeAnimation: 'fade-in',
                    expand: false,
                    theme: 'gradient',
                    timeline: true,
                    removeOn: 'click'
                    }]
                    const bell = new Bell(...params)
                    bell.launch()
        }
        // registrarReactivo
        else if (onmessage[0] == '0006') {
            tablaReactivo();
            
                const params = [{
                    title: "Nuevo Reactivo"
                    },
                    'info',
                    {
                    animate: true,
                    isColored: true,
                    screenTime: '15000',
                    transitionDuration: '500',
                    position: 'bottom-right',
                    typeAnimation: 'fade-in',
                    expand: false,
                    theme: 'gradient',
                    timeline: true,
                    removeOn: 'click'
                    }]
                    const bell = new Bell(...params)
                    bell.launch()
        }
    }

    else if ((local == 'parametros.php') && (userActive != onmessage[1])) {
        // actualizarExamen o eliminarExamen
        if (((onmessage[0] == '0008') || (onmessage[0] == '0010')) && (((document.getElementById('valorEditarExamenId').value == onmessage[2]) && (document.getElementById('modalExamenEditar').checked == true)) || ((document.getElementById('valorEliminarExamenId').value == onmessage[2]) && (document.getElementById('modalExamenEliminar').checked == true)))) {
            tablaExamen();
            document.getElementById('modalExamenEditar').checked = false;
            document.getElementById('modalExamenEliminar').checked = false;

                const params = [{
                    title: "Otro usuario modifico " + onmessage[3]
                    },
                    'info',
                    {
                    animate: true,
                    isColored: true,
                    screenTime: '15000',
                    transitionDuration: '500',
                    position: 'bottom-right',
                    typeAnimation: 'fade-in',
                    expand: false,
                    theme: 'gradient',
                    timeline: true,
                    removeOn: 'click'
                    }]
                    const bell = new Bell(...params)
                    bell.launch()

        }
        // registrarExamen
        else if (onmessage[0] == '0009') {
            tablaExamen();
          
                const params = [{
                    title: "Nuevo examen"
                    },
                    'info',
                    {
                    animate: true,
                    isColored: true,
                    screenTime: '15000',
                    transitionDuration: '500',
                    position: 'bottom-right',
                    typeAnimation: 'fade-in',
                    expand: false,
                    theme: 'gradient',
                    timeline: true,
                    removeOn: 'click'
                    }]
                    const bell = new Bell(...params)
                    bell.launch()
        }

    }
};