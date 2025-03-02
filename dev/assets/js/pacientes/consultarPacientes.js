
filtroTabletResultados('searchInput', 'patientTableBody');
filtroTabletResultados('searchInputHistorial', 'tableBodyHistorial');
filtroTabletResultados('searchInputAlerta', 'tableBodyAlerta');


filtroTabletResultados('searchInputTableContenedorCheck', 'contenedorCheck');

document.getElementById('addPatientButton').addEventListener('click', function () {

	DatosRegistrarPacientes();
	modal('registrarPacientesModal');
});
function DatosRegistrarPacientesUpdate() {
	sendRequest('pacientes/consultDatosRegistrarPacientes', {}, response => {
		if (response.estatus === 'éxito') {
			document.getElementById('tipoCedulaUpdate').innerHTML = "";
			response.respuesta.tipoCedula.forEach(item => insertConten(item, 'tipoCedulaUpdate'));

			document.getElementById('conveniosUpdate').innerHTML = "";
			response.respuesta.convenios.forEach(item => insertConten(item, 'conveniosUpdate'));

			document.getElementById('pacienteUpdate').innerHTML = "";
			response.respuesta.tipoPaciente.forEach(item => insertConten(item, 'pacienteUpdate'));

			document.getElementById('updateSexo').innerHTML = "";
			response.respuesta.sexo.forEach(item => insertConten(item, 'updateSexo'));
		} else {
			showNotification("Error: " + response.respuesta, "info");
		}
	}, 'GET').catch(error => {
		showNotification("Error: " + error.respuesta, "info");
	});
}




function tableBodyHistorial(idPaciente) {
	sendRequest('pacientes/consultarHistorial', { id: idPaciente }, response => {
		if (typeof response === 'object') {
			document.getElementById('tableBodyHistorial').innerHTML = '';
			response.forEach(item => insertContenTableBodyHistorial(item));
		} else {
			showNotification('Error: ' + response.respuesta, 'error');
		}
	}).catch(error => {
		showNotification('Error: ' + error, 'error');
	});
}


function insertContenTableBodyHistorial(v) {
	var tbody = document.getElementById('tableBodyHistorial');
	var fila = tbody.insertRow()
	const celda1 = fila.insertCell();
	celda1.innerHTML = v.fecha;

	const celda2 = fila.insertCell();
	celda2.innerHTML = v.examen;

	const celda3 = fila.insertCell();
	celda3.innerHTML = v.resultado;

	const celda32 = fila.insertCell();
	celda32.innerHTML = v.referencia;

	const celda4 = fila.insertCell();
	celda4.innerHTML = v.analista;

	const celda5 = fila.insertCell();
	const boton = document.createElement("button");
	boton.innerHTML = `<svg viewBox="0 -960 960 960"">
	<path fill="currentColor" d="M80-200v-80h400v80H80Zm0-200v-80h200v80H80Zm0-200v-80h200v80H80Zm744 400L670-354q-24 17-52.5 25.5T560-320q-83 0-141.5-58.5T360-520q0-83 58.5-141.5T560-720q83 0 141.5 58.5T760-520q0 29-8.5 57.5T726-410l154 154-56 56ZM560-400q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Z"/></svg>
            <span class="description">Historial</span> `;
	boton.className = "action-button historial-button";
	boton.type = "button";
	boton.onclick = function () {
		resultadoHistorial(v.id);
	};

	celda5.appendChild(boton);

}









function agregarContenidoTablaPaciente(v) {
	var tbody = document.getElementById('patientTableBody');
	// Crea una nueva fila
	var fila = tbody.insertRow();
	// Crea las celdas y agrega contenido
	const celda1 = fila.insertCell();
	celda1.innerHTML = v.tipo_cedula + v.cedula;

	const celda2 = fila.insertCell();
	celda2.innerHTML = v.nombre;

	const celda3 = fila.insertCell();
	celda3.innerHTML = v.apellido;

	const celda32 = fila.insertCell();
	celda32.innerHTML = v.sexo;

	const celda4 = fila.insertCell();
	celda4.innerHTML = v.fecha;

	const celda5 = fila.insertCell();
	celda5.innerHTML = v.telefono;

	const celda6 = fila.insertCell();
	celda6.className = "action-buttons";



	const boton = document.createElement("button");
	boton.innerHTML = `<svg viewBox="0 0 24 24">
					<path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
				</svg> 
            <span class="description">Editar</span>`;
	boton.className = "action-button edit-button";
	boton.type = "button";
	boton.onclick = async function () {
		// Esperar a que la función DatosRegistrarPacientesUpdate() termine
		await DatosRegistrarPacientesUpdate();

		// Asignar valores después de que la promesa se resuelva
		document.getElementById('tipoCedulaUpdate').value = v.tipo_cedulaId;
		document.getElementById('cedulaUpdate').value = v.cedula;
		document.getElementById('nombreUpdate').value = v.nombre;
		document.getElementById('apellidoUpdate').value = v.apellido;
		document.getElementById('telefonoUpdate').value = v.telefono;
		document.getElementById('fechaUpdate').value = await formatearFechaISO(v.fecha2); // Asegúrate de que 'v.fecha2' esté en formato YYYY-MM-DD
		document.getElementById('conveniosUpdate').value = v.convenio;
		document.getElementById('pacienteUpdate').value = v.paciente;
		document.getElementById('idUpdate').value = v.id;
		document.getElementById('updateSexo').value = v.sexoId;
		// Agregar clase 'active' a los elementos
		document.getElementById('tipoCedulaUpdate').className = 'active';
		document.getElementById('cedulaUpdate').className = 'active';
		document.getElementById('nombreUpdate').className = 'active';
		document.getElementById('apellidoUpdate').className = 'active';
		document.getElementById('telefonoUpdate').className = 'active';
		document.getElementById('fechaUpdate').className = 'active';
		document.getElementById('conveniosUpdate').className = 'active';
		document.getElementById('pacienteUpdate').className = 'active';
		document.getElementById('updateSexo').className = 'active';

		// Mostrar el modal
		modal('updatePacientesModal');

	};

	const boton2 = document.createElement("button");
	boton2.innerHTML = `<svg viewBox="0 0 24 24">
					<path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
				</svg> 
            <span class="description">Eliminar</span>`;
	boton2.className = "action-button delete-button";
	boton2.type = "button";
	boton2.onclick = function () {
		pacienteDelete(v);
	};
	const boton3 = document.createElement("button");
	boton3.innerHTML = `<svg viewBox="0 -960 960 960"">
	<path fill="currentColor" d="m520-120 34-331q-57-15-86-39.5T410-544l-95 94 85 85v245h-80v-210l-31-28 7 54-147 189-63-49 126-162-57-112q-8-17-9-42.5t17-43.5l134-132q12-12 26.5-18t29.5-6q24 0 38 9t19 14l80 79q27 27 66 42.5t84 15.5h66q23 0 40 15.5t19 38.5l26 254q13 8 21 21.5t8 30.5q0 25-17.5 42.5T760-100q-25 0-43-17.5T699-160q0-17 8-30.5t22-21.5l-5-48H594l-14 140h-60Zm-20-540q-33 0-56.5-23.5T420-740q0-33 23.5-56.5T500-820q33 0 56.5 23.5T580-740q0 33-23.5 56.5T500-660Zm100 340h118l-14-140h-89l-15 140Z"/>
	</svg>
            <span class="description">Agregar</span> `;
	boton3.className = "action-button agregar-button";
	boton3.type = "button";
	boton3.onclick = function () {
		tablaPacienteExamen(v.id);
		const botonAlert = document.querySelector(".container-svg-alert");
		botonAlert.style.display = "none";
		tablaAlertasPaciente(v.id, v.nombre + ' ' + v.apellido);

		modal('formAnalisisModal');

		///////////////////////////////////////////////////////////

		const totalSpan = document.querySelector(".span-total");
		totalSpan.textContent = "0"

		////////////////////////////////////////////////

	};

	const boton4 = document.createElement("button");
	boton4.innerHTML = `<svg viewBox="0 -960 960 960"">
	<path fill="currentColor" d="M320-160q-33 0-56.5-23.5T240-240v-120h120v-90q-35-2-66.5-15.5T236-506v-44h-46L60-680q36-46 89-65t107-19q27 0 52.5 4t51.5 15v-55h480v520q0 50-35 85t-85 35H320Zm120-200h240v80q0 17 11.5 28.5T720-240q17 0 28.5-11.5T760-280v-440H440v24l240 240v56h-56L510-514l-8 8q-14 14-29.5 25T440-464v104ZM224-630h92v86q12 8 25 11t27 3q23 0 41.5-7t36.5-25l8-8-56-56q-29-29-65-43.5T256-684q-20 0-38 3t-36 9l42 42Zm376 350H320v40h286q-3-9-4.5-19t-1.5-21Zm-280 40v-40 40Z"/></svg>
            <span class="description">Historial</span> `;
	boton4.className = "action-button historial-button";
	boton4.type = "button";
	boton4.onclick = function () {
		document.getElementById('nombrePacienteHistorial').innerHTML = v.nombre + ' ' + v.apellido + ' ' + v.tipo_cedula + v.cedula;
		tableBodyHistorial(v.id);
		modal('HistorialPacientesModal');

	};

	celda6.appendChild(boton);
	celda6.appendChild(boton2);
	celda6.appendChild(boton3);
	celda6.appendChild(boton4);
}

function agregarContenidoTablaPacienteExamen(v, tabla, clase) {
	const tbody = document.getElementById(tabla);

	const div = document.createElement("tr");
	div.className = 'checkbox-wrapper';

	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.name = v.id;
	checkbox.className = clase;
	checkbox.id = `chekc${v.id}`;
	checkbox.checked = false;

	const label = document.createElement("label");
	label.htmlFor = `chekc${v.id}`;
	label.className = "label";

	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width", "45");
	svg.setAttribute("height", "45");
	svg.setAttribute("viewBox", "0 0 95 95");

	const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	rect.setAttribute("x", "30");
	rect.setAttribute("y", "20");
	rect.setAttribute("width", "50");
	rect.setAttribute("height", "50");
	rect.setAttribute("stroke", "black");
	rect.setAttribute("fill", "none");

	const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
	g.setAttribute("transform", "translate(0,-952.36222)");

	const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("d", "m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4");
	path.setAttribute("stroke", "#cc2323");
	path.setAttribute("stroke-width", "3");
	path.setAttribute("fill", "none");
	path.classList.add("path1");

	g.appendChild(path);
	svg.appendChild(rect);
	svg.appendChild(g);

	label.appendChild(svg);
	label.appendChild(document.createTextNode(`${v.nombre} ${v.descripcion}`));

	const td = document.createElement("td");
	const td2 = document.createElement("td");


	// AGREGADO POR RICARDO////////////////////////////////////////////

	const inputPrecio = document.createElement("input");
	inputPrecio.type = "hidden";
	inputPrecio.value = v.precio;
	inputPrecio.id = v.id;

	td.appendChild(inputPrecio);
	td.appendChild(checkbox);

	td.appendChild(label);


	td2.className = "none";
	div.appendChild(td);
	div.appendChild(td2);
	tbody.appendChild(div);



	checkbox.addEventListener("click", () => {

		const totalSpan = document.querySelector(".span-total");
		const total = totalSpan.textContent
		valorAgregar = checkbox.previousElementSibling.value

		if (checkbox.checked) {

			precioTotal = parseInt(total) + parseInt(valorAgregar)
			totalSpan.innerHTML = ""
			totalSpan.innerText = precioTotal
		} else {
			precioTotal = parseInt(total) - parseInt(valorAgregar)
			totalSpan.innerHTML = ""
			totalSpan.innerText = precioTotal
		}
	})



} function agregarContenidoTablaPacienteExamenCm(v, tabla, clase) {
	const tbody = document.getElementById(tabla);

	const div = document.createElement("tr");
	div.className = 'checkbox-wrapper';

	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.name = v.id;
	checkbox.className = clase;
	checkbox.id = `chekcll${v.id}`;
	checkbox.checked = false;

	const label = document.createElement("label");
	label.htmlFor = `chekcll${v.id}`;
	label.className = "label";

	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("width", "45");
	svg.setAttribute("height", "45");
	svg.setAttribute("viewBox", "0 0 95 95");

	const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	rect.setAttribute("x", "30");
	rect.setAttribute("y", "20");
	rect.setAttribute("width", "50");
	rect.setAttribute("height", "50");
	rect.setAttribute("stroke", "black");
	rect.setAttribute("fill", "none");

	const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
	g.setAttribute("transform", "translate(0,-952.36222)");

	const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("d", "m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4");
	path.setAttribute("stroke", "#cc2323");
	path.setAttribute("stroke-width", "3");
	path.setAttribute("fill", "none");
	path.classList.add("path1");

	g.appendChild(path);
	svg.appendChild(rect);
	svg.appendChild(g);

	label.appendChild(svg);
	label.appendChild(document.createTextNode(v.nombre));

	const td = document.createElement("td");
	const td2 = document.createElement("td");


	// AGREGADO POR RICARDO////////////////////////////////////////////

	const inputPrecio = document.createElement("input");
	inputPrecio.type = "hidden";
	inputPrecio.value = v.precio;
	inputPrecio.id = v.id;

	td.appendChild(inputPrecio);
	td.appendChild(checkbox);

	td.appendChild(label);

	td2.className = "none";
	div.appendChild(td);
	div.appendChild(td2);
	tbody.appendChild(div);



	checkbox.addEventListener("click", () => {

		const totalSpan = document.querySelector(".span-total");
		const total = totalSpan.textContent
		valorAgregar = checkbox.previousElementSibling.value

		if (checkbox.checked) {

			precioTotal = parseInt(total) + parseInt(valorAgregar)
			totalSpan.innerHTML = ""
			totalSpan.innerText = precioTotal
		} else {
			precioTotal = parseInt(total) - parseInt(valorAgregar)
			totalSpan.innerHTML = ""
			totalSpan.innerText = precioTotal
		}
	})



}




function agregarContenidoTablaAlertasPaciente(v) {
	var tbody = document.getElementById('tableBodyAlerta');
	var fila = tbody.insertRow()
	const celda1 = fila.insertCell();
	celda1.innerHTML = v.fecha;

	const celda2 = fila.insertCell();
	celda2.innerHTML = v.alerta;

	const celda3 = fila.insertCell();
	celda3.innerHTML = v.nombreExamen;

	const celda32 = fila.insertCell();
	celda32.innerHTML = v.valor;

	const celda4 = fila.insertCell();
	celda4.innerHTML = v.referencia;

	const celda5 = fila.insertCell();
	const boton = document.createElement("button");
	boton.innerHTML = `<svg viewBox="0 -960 960 960"">
	<path fill="currentColor" d="M80-200v-80h400v80H80Zm0-200v-80h200v80H80Zm0-200v-80h200v80H80Zm744 400L670-354q-24 17-52.5 25.5T560-320q-83 0-141.5-58.5T360-520q0-83 58.5-141.5T560-720q83 0 141.5 58.5T760-520q0 29-8.5 57.5T726-410l154 154-56 56ZM560-400q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Z"/></svg>
            <span class="description">Historial</span> `;
	boton.className = "action-button historial-button";
	boton.type = "button";
	boton.onclick = function () {
		resultadoHistorial(v.id);
	};

	celda5.appendChild(boton);

}

const botonAlert = document.querySelector(".container-svg-alert");
botonAlert.style.display = "none";

botonAlert.addEventListener("click", () => {
	modal('alertaPacientesModal');
})



function tablaAlertasPaciente(v, v2) {
	sendRequest('pacientes/consultarAlertas', { id: v }, response => {
		if (typeof response === 'object') {
			if (response.length < 1) {
				botonAlert.style.display = "none";
			} else {
				botonAlert.style.display = "block";
			}

			document.getElementById('nombrePacienteAlerta').innerHTML = v2;
			document.getElementById('tableBodyAlerta').innerHTML = "";
			response.forEach(alerta => {
				agregarContenidoTablaAlertasPaciente(alerta);
			});
		} else {
			showNotification("Error: " + response.respuesta, 'error');
		}
	});
}


//////////////////////////////////////////////////////////////////



function pacienteDelete(v) {
	document.getElementById('nombrePAcienteDelete').textContent = v.nombre + ' ' + v.apellido + ' ' + 'Cedula:' + v.tipo_cedula + v.cedula;
	document.getElementById('valorIdPacienteDelete').value = v.id;
	modal('pacienteDeleteModal');
}


function tablaPaciente() {
	sendRequest('pacientes/consultarPaciente', {}, response => {
		if (response.estatus === 'éxito') {
			document.getElementById('patientTableBody').innerHTML = "";
			response.respuesta.forEach(paciente => {
				agregarContenidoTablaPaciente(paciente);
			});
		} else {
			showNotification(response.respuesta, 'info');
		}
	}, 'GET').catch(error => {
		showNotification(error.respuesta, 'info');
	});
}


document.getElementById('pacienteConsultar').addEventListener('click', () => {
	tablaPaciente();
});




function tablaPacienteExamen(v1) {
	sendRequest('pacientes/consultarExamen', { id: v1 }, response => {
		if (typeof response === 'object') {
			document.getElementById('contenedorCheck').innerHTML = "";
			document.getElementById('examenParaPaciente').value = v1;
			response.forEach(examen => {
				agregarContenidoTablaPacienteExamen(examen, 'contenedorCheck', 'checkexamenPaciente check');
			});
		} else {
			showNotification(response.respuesta, 'info');
		}
	});
}

function resultadoHistorial(v) {
	sendRequest('pacientes/consultarResultadoHistorial', { examen_id: v }, response => {
		if (typeof response.respuesta === "object") {
			document.getElementById('span-numero-historial').innerHTML = response.respuesta.numero;
			document.getElementById('span-nombre-historial').innerHTML = response.respuesta.nombre;
			document.getElementById('span-fecha-historial').innerHTML = response.respuesta.fecha;
			document.getElementById('span-edad-historial').innerHTML = response.respuesta.edad;
			document.getElementById('span-sexo-historial').innerHTML = response.respuesta.sexo;
			document.getElementById('span-cedula-historial').innerHTML = response.respuesta.cedula;
			document.getElementById('span-remitida-historial').innerHTML = response.respuesta.remitida;
			document.getElementById('resultadoPacientesServicioHistorial').innerHTML = response.respuesta.servicio;
			document.getElementById('noteResultadosFormularioHistorial').innerHTML = response.respuesta.nota;
			document.getElementById('span-nombre-analista-historial').innerHTML = response.respuesta.analista;
			document.getElementById('span-cargo-historial').innerHTML = response.respuesta.cargo;
			document.getElementById('idExamenesResultadosHistorial').value = v;

			if (response.respuesta.factura === 'N/A' || response.respuesta.factura === '0') {
				document.getElementById('exportarPdf').type = 'button';
				document.getElementById('exportarPdf').className = 'export-button button noExport';
				document.getElementById("exportarPdfWhatsAppAp").style.display = "none";

			} else {
				document.getElementById('exportarPdf').type = 'submit';
				document.getElementById('exportarPdf').className = 'export-button button';
			}
			generateQRCode(v);
			const tabla = document.getElementById("tbodyCargarResultadosHistorial");
			tabla.innerHTML = "";
			response.respuesta.examenes.forEach(examen => {
				const filaExamen = document.createElement('tr');
				const celdaExamen = document.createElement('td');
				celdaExamen.colSpan = 3; // Ocupa todas las columnas
				celdaExamen.textContent = examen.nombre_examen;
				celdaExamen.style.fontWeight = 'bold'; // Estilo para resaltar
				celdaExamen.style.textAlign = 'center'; // Centrar el texto
				celdaExamen.style.borderTop = '2px solid black'; // Borde superior
				filaExamen.appendChild(celdaExamen);
				tabla.appendChild(filaExamen);

				const filaEncabezados = document.createElement('tr');
				const encabezados = ["ANÁLISIS", "VALOR PACIENTE", "VALORES REFERENCIALES"];
				encabezados.forEach(encabezado => {
					const celdaEncabezado = document.createElement('th');
					celdaEncabezado.textContent = encabezado;
					filaEncabezados.appendChild(celdaEncabezado);
				});

				tabla.appendChild(filaEncabezados);

				examen.analisis.forEach(analisis => {
					resultadosHistorialPacienteModal(analisis, 'tbodyCargarResultadosHistorial');
				});

			});










			modal('resultadoAnalisisModal');
		} else {
			showNotification(response.respuesta, 'info');
		}
	}).catch(error => {
		showNotification(error, 'info');
	});
}

//  'buscando en el Historial', 'listo'

function resultadosHistorialPacienteModal(v, id) {
	var tbody = document.getElementById(id);
	var fila = tbody.insertRow();
	const celda1 = fila.insertCell();
	celda1.innerHTML = v.nombre;
	const celda2 = fila.insertCell();
	celda2.innerHTML = v.valor;
	const celda3 = fila.insertCell();
	celda3.innerHTML = v.referencia;
}
function generateQRCode(v) {
	// Limpiar el contenedor del QR
	let qrContainer = document.getElementById("qrcodeHistorial");
	qrContainer.innerHTML = ""; // Eliminar contenido previo

	// Crear el nuevo QR
	let qrcode = new QRCode(qrContainer, {
		text: String(v),
		width: 97,
		height: 97,
		colorDark: "#000000",
		colorLight: "#ffffff",
		correctLevel: QRCode.CorrectLevel.H
	});

	let qrCanvas = document.querySelector("#qrcodeHistorial canvas");
	let qrContext = qrCanvas.getContext("2d");

	// Verificar si el canvas existe, si no, crearlo
	let canvas = document.getElementById("canvasHistorial");
	if (!canvas) {
		canvas = document.createElement("canvas");
		canvas.id = "canvasHistorial";
		document.body.appendChild(canvas); // Añadir el canvas al cuerpo del documento o a un contenedor específico
	}

	let context = canvas.getContext("2d");
	canvas.width = qrCanvas.width;
	canvas.height = qrCanvas.height;

	// Cargar la imagen
	let img = new Image();
	img.src = "assets/img/png/logo.png"; // Reemplaza con la ruta de tu imagen

	img.onload = function () {
		// Dibujar el QR en el canvas
		context.drawImage(qrCanvas, 0, 0);

		// Calcular la posición para centrar la imagen
		let imgSize = 95; // Tamaño de la imagen
		let x = (canvas.width - imgSize) / 2;
		let y = (canvas.height - imgSize) / 2;

		// Cambiar la opacidad
		context.globalAlpha = 0.7; // Ajusta el valor entre 0 (transparente) y 1 (opaco)

		// Dibujar la imagen en el centro
		context.drawImage(img, x, y, imgSize, imgSize);

		// Convertir el canvas a imagen y enviarla al servidor
		let dataURL = canvas.toDataURL("image/png");
		document.getElementById("dataqrHistorial").value = dataURL;

		// Eliminar el QR original antes de reemplazarlo
		qrContainer.innerHTML = "";
		qrContainer.appendChild(canvas);
		canvas.style.display = "block";
	};
}

