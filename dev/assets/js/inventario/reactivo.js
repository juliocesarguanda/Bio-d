filtroTabletResultados('searchInputReactivo', 'patientTableBodyReactivo');

 consultarAlertas()

function agregarContenidoTablaReactivo(v){
	var tbody = document.getElementById('patientTableBodyReactivo');
	// Crea una nueva fila
	var fila = tbody.insertRow();
	// Crea las celdas y agrega contenido
	const celda1 = fila.insertCell();
	celda1.innerHTML = v.nombre;

	const celda2 = fila.insertCell();
	celda2.innerHTML = v.marca;

	const celda3 = fila.insertCell();
	celda3.innerHTML = v.disponible + " " +"personas";

	const celda4 = fila.insertCell();
	celda4.innerHTML = v.cantidad + " " +"ml";

	const celda6 = fila.insertCell();
	celda6.className = "action-buttons";

	const boton2 = document.createElement("button");
	boton2.innerHTML = `<svg viewBox="0 0 24 24">
					<path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
				</svg> 
            <span class="description">Eliminar</span>`;
	boton2.className = "action-button delete-button";
	boton2.type = "button";
	boton2.onclick = function () {
         document.getElementById('nombreReactivoEliminar').textContent = v.nombre + ' ' +  v.marca;
        document.getElementById('valorEliminarReactivoId').value = v.id;
        modal('reactivoDeleteModal');
	};
	const boton3 = document.createElement("button");
	boton3.innerHTML = `<svg viewBox="0 0 24 24">
					<path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
				</svg> 
            <span class="description">Editar</span>`;
	boton3.className = "action-button edit-button";
	boton3.type = "button";
	boton3.onclick = function () {
        document.getElementById('valorEditarReactivoId').value = v.id;

        document.getElementById('nombreReactivoEditar').value = v.nombre;
        document.getElementById('marcaReactivoEditar').value = v.marca;
        document.getElementById('cantidadReactivoEditar').value = v.cant;
        document.getElementById('requeridoReactivoEditar').value = v.cantidad;

        document.getElementById('nombreReactivoEditar').className = 'active';
        document.getElementById('marcaReactivoEditar').className = 'active';
        document.getElementById('cantidadReactivoEditar').className = 'active';
        document.getElementById('requeridoReactivoEditar').className = 'active';
        modal('reactivoEditModal');
	};


    const boton4 = document.createElement("button");
    boton4.innerHTML = `<svg  viewBox="0 -960 960 960">
                    <path fill="currentColor" d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80ZM294-511l56-57 56 57 43-43-57-56 57-56-43-43-56 57-56-57-43 43 57 56-57 56 43 43Zm186 351q133 0 226.5-93.5T800-480q0-66-25-124t-69-102L254-254q44 44 102 69t124 25Zm82-96-96-96 42-43 54 54 100-99 42 42-142 142Z"/></svg>
            <span class="description">Agregar</span>`;
    boton4.className = "action-button agregar-button";
    boton4.type = "button";
    boton4.onclick = function () {
        document.getElementById('valorIngresarReactivoId').value = v.id;
       
        modal('reactivoIngresarModal');
    };

    
	celda6.appendChild(boton3);
	celda6.appendChild(boton2);
    celda6.appendChild(boton4);
}




function tablaReactivo() {
    sendRequest('inventario/tablaReactivo', {}, response => {
        if (response.estatus === 'éxito') {
            document.getElementById("patientTableBodyReactivo").innerHTML = "";
            response.respuesta.forEach(item => {
                agregarContenidoTablaReactivo(item);
            });
        } else {
            showNotification(response.respuesta, 'info');
        }
    }, 'GET').catch(error => {
        showNotification(error.respuesta, 'info');
    });
}

document.getElementById('reactivo_inventario').addEventListener('click', () => {
        tablaReactivo();
});

document.getElementById('addPatientButtonReactivo').addEventListener('click', () => {
    modal('reactivoAgregarModal');
});


document.getElementById('reactivoPdf').addEventListener('click', () => {
    generarPDF('inventario/Reactivos');
});
