

filtroTabletResultados('searchInputMiscelaneo', 'patientTableBodyMiscelaneo');



function agregarContenidoTablaMiscelaneo(v){
	var tbody = document.getElementById('patientTableBodyMiscelaneo');
	// Crea una nueva fila
	var fila = tbody.insertRow();
	// Crea las celdas y agrega contenido
	const celda1 = fila.insertCell();
	celda1.innerHTML = v.nombre;

	const celda4 = fila.insertCell();
	celda4.innerHTML = v.cantidad;

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
         document.getElementById('nombreMiscelaneoEliminar').textContent = v.nombre;
        document.getElementById('valorEliminarMiscelaneoId').value = v.id;
        modal('miscelaneoDeleteModal');
	};
	const boton3 = document.createElement("button");
	boton3.innerHTML = `<svg viewBox="0 0 24 24">
					<path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
				</svg> 
            <span class="description">Editar</span>`;
	boton3.className = "action-button edit-button";
	boton3.type = "button";
	boton3.onclick = function () {
        document.getElementById('valorEditarMiscelaneoId').value = v.id;

        document.getElementById('nombreMiscelaneoEditar').value = v.nombre;
        document.getElementById('cantidadMiscelaneoEditar').value = v.cantidad;

        document.getElementById('nombreMiscelaneoEditar').className = 'active';
        document.getElementById('cantidadMiscelaneoEditar').className = 'active';
        modal('miscelaneoEditModal');
	};



    const boton4 = document.createElement("button");
    boton4.innerHTML = `<svg  viewBox="0 -960 960 960">
                    <path fill="currentColor" d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80ZM294-511l56-57 56 57 43-43-57-56 57-56-43-43-56 57-56-57-43 43 57 56-57 56 43 43Zm186 351q133 0 226.5-93.5T800-480q0-66-25-124t-69-102L254-254q44 44 102 69t124 25Zm82-96-96-96 42-43 54 54 100-99 42 42-142 142Z"/></svg>
            <span class="description">Agregar</span>`;
    boton4.className = "action-button agregar-button";
    boton4.type = "button";
    boton4.onclick = function () {
        document.getElementById('valorIngresarMiscelaneoId').value = v.id;

        modal('miscelaneoIngresarModal');
    };

	celda6.appendChild(boton3);
	celda6.appendChild(boton2);
    celda6.appendChild(boton4);
}





function tablaMiscelaneo() {
    sendRequest('inventario/tablaMiscelaneo', {}, response => {
        if (response.estatus === 'éxito') {
            document.getElementById("patientTableBodyMiscelaneo").innerHTML = "";
            response.respuesta.forEach(item => {
                agregarContenidoTablaMiscelaneo(item);
            });
        } else {
            showNotification(response.respuesta, 'info');
        }
    }, 'GET').catch(error => {
        showNotification(error.respuesta, 'info');
    });
}
document.getElementById('miscelaneo_inventario').addEventListener('click', () => {
        tablaMiscelaneo();
});

document.getElementById('addPatientButtonMiscelaneo').addEventListener('click', () => {
        modal('miscelaneoAgregarModal');
});
document.getElementById('miscelaneoPdf').addEventListener('click', () => {
    generarPDF('inventario/Miscelaneo');

});
