// Obtener todos los inputs con clase "datos"



filtroTabletResultados('searchInputPendientesDia', 'patientTableBodyPendientesDia');
filtroTabletResultados('searchInputTableContenedorCheckEliminarExamenes', 'contenedorCheckEliminarExamenes');





function mostrarPendientesDia(v) {
	let tbody = document.getElementById('patientTableBodyPendientesDia');

	// Crea una nueva fila
	let fila = tbody.insertRow();
	// Crea las celdas y agrega contenido
	const celda1 = fila.insertCell();
	celda1.innerHTML =  v.paciente_dia;

	const celda2 = fila.insertCell();
	celda2.innerHTML = v.paciente_nombre;

	const celda3 = fila.insertCell();
	celda3.innerHTML =v.sexo_valor;

	const celda4 = fila.insertCell();
	celda4.innerHTML = v.cedula;

	const celda5 = fila.insertCell();
	celda5.innerHTML = v.examen_nombre;

	const celda6 = fila.insertCell();
	celda6.innerHTML =  v.valor;

	const celda7 = fila.insertCell();
	celda7.innerHTML = v.referencia;

	const celda8 = fila.insertCell();
	celda8.innerHTML = v.servicio_nombre;

	const celda9 = fila.insertCell();
	celda9.innerHTML = v.convenio_nombre;

	const celda10 = fila.insertCell();
	celda10.innerHTML = v.cargo;

	const celda11 = fila.insertCell();
	celda11.innerHTML = v.fecha;
	celda11.className = 'none';

	const celda12 = fila.insertCell();
	celda12.className = "action-buttons";



	
	const boton4 = document.createElement("button");
	boton4.innerHTML = `<svg viewBox="0 -960 960 960"">
	<path fill="currentColor" d="M320-160q-33 0-56.5-23.5T240-240v-120h120v-90q-35-2-66.5-15.5T236-506v-44h-46L60-680q36-46 89-65t107-19q27 0 52.5 4t51.5 15v-55h480v520q0 50-35 85t-85 35H320Zm120-200h240v80q0 17 11.5 28.5T720-240q17 0 28.5-11.5T760-280v-440H440v24l240 240v56h-56L510-514l-8 8q-14 14-29.5 25T440-464v104ZM224-630h92v86q12 8 25 11t27 3q23 0 41.5-7t36.5-25l8-8-56-56q-29-29-65-43.5T256-684q-20 0-38 3t-36 9l42 42Zm376 350H320v40h286q-3-9-4.5-19t-1.5-21Zm-280 40v-40 40Z"/></svg>
            <span class="description">Historial</span> `;
	boton4.className = "action-button historial-button";
	boton4.type = "button";
	boton4.onclick = function () {
		document.getElementById('nombrePacienteHistorial').innerHTML = v.nombre + ' ' + v.apellido + ' ' + v.tipo_cedula + v.cedula;
		resultadoHistorial(v.paciente_examen_id);

	};

	celda12.appendChild(boton4);
	
}


function tablaPendientesDia() {
    sendRequest('pacientes/consultarPacienteDia', {}, response => {
        let cantidad = 0;

        if (typeof response.respuesta == 'object' && response.estatus == 'éxito') {
            document.getElementById('patientTableBodyPendientesDia').innerHTML = "";
            response.respuesta.forEach(item => {
                mostrarPendientesDia(item);

                if (cantidad < item.paciente_dia) {
                    cantidad = item.paciente_dia;
                    document.getElementById('cantidadDelDia').innerHTML = item.paciente_dia;
                }
            });
        } else {
            showNotification(response.respuesta, 'info');
        }
    }).catch(error => {
        showNotification(error.respuesta, 'info');
    });
}
document.getElementById('pacienteDelDia').addEventListener('click', () => {
		tablaPendientesDia();
});




document.getElementById("PacienteExamenPendienteModalSi").addEventListener("click", function () {
	tablaPacienteExamen(document.getElementById('valorIdPacienteExamenPendiente').value);
	tablaPacienteExamenCombo(document.getElementById('valorIdPacienteExamenPendiente').value);
	modalClose('agregarExamenesModal');
	modal('formAnalisisModal');

	///////////////////////////////////////////////////////////

	const totalSpan = document.querySelector(".span-total");
	totalSpan.textContent = "0"

	////////////////////////////////////////////////
});


function generateQRCodeConsult(v) {
	// Limpiar el contenedor del QR
	let qrContainer = document.getElementById("qrcode");
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

	let qrCanvas = document.querySelector("#qrcode canvas");
	let qrContext = qrCanvas.getContext("2d");

	// Verificar si el canvas existe, si no, crearlo
	let canvas = document.getElementById("canvas");
	if (!canvas) {
		canvas = document.createElement("canvas");
		canvas.id = "canvas";
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
		document.getElementById("dataqr").value = dataURL;

		// Eliminar el QR original antes de reemplazarlo
		qrContainer.innerHTML = "";
		qrContainer.appendChild(canvas);
		canvas.style.display = "block";
	};
}



function toggleAlert(button) {
	const inputContainer = button.nextElementSibling;
	inputContainer.classList.toggle('show');

	if (inputContainer.classList.contains('show')) {
		const input = inputContainer.querySelector('input');
		input.focus();

		// Add click outside listener
		document.addEventListener('click', function closeAlert(e) {
			if (!inputContainer.contains(e.target) && !button.contains(e.target)) {
				inputContainer.classList.remove('show');
				document.removeEventListener('click', closeAlert);
			}
		});
	}
}

function checkAlertValue(input) {
	const button = input.parentElement.previousElementSibling;
	if (input.value.trim() !== '') {
		button.classList.add('has-alert');
	} else {
		button.classList.remove('has-alert');
	}
}

// Close alert when clicking outside
document.addEventListener('click', function (e) {
	const openInputs = document.querySelectorAll('.input-container-alert.show');
	openInputs.forEach(container => {
		if (!container.contains(e.target) && !container.previousElementSibling.contains(e.target)) {
			container.classList.remove('show');
			// Mantenemos la clase has-alert si hay texto en el input
			const input = container.querySelector('input');
			if (input.value.trim() === '') {
				container.previousElementSibling.classList.remove('has-alert');
			}
		}
	});
});

// Verificar el valor cuando el input pierde el foco
document.querySelectorAll('.input-container-alert input').forEach(input => {
	input.addEventListener('blur', function () {
		checkAlertValue(this);
	});
});

// Verificar el valor cuando se escribe en el input
document.querySelectorAll('.input-container-alert input').forEach(input => {
	input.addEventListener('input', function () {
		checkAlertValue(this);
	});
});


