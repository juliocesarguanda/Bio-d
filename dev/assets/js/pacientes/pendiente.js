filtroTabletResultados('searchInputPendientes', 'patientTableBodyPendientes');
filtroTabletResultados('searchInputTableContenedorCheckEliminarExamenes', 'contenedorCheckEliminarExamenes');




















function validarExtension(nombreArchivo) {
    return nombreArchivo.toLowerCase().endsWith('.txt');
}

function validarFormatoArchivo(contenido) {
    const lineas = contenido.split('\n').filter(l => l.trim() !== '');

    const encabezadoEsperado = [
        "Solicitar Tiempo",
        "Nombre/ID",
        "Prueba",
        "Absorbencia",
        "Concentración",
        "Interpretación",
        "Referencia"
    ];

    if (lineas.length === 0) throw new Error('Archivo vacío');

    const normalizar = texto =>
        texto.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]/g, '')
            .toLowerCase();

    const encabezadoRecibido = lineas[0]
        .replace(/\r/g, '')
        .split('\t')
        .map(c => c.trim())
        .filter(c => c !== '')
        .map(normalizar);

    const encabezadoEsperadoNormalizado = encabezadoEsperado.map(normalizar);

    if (encabezadoRecibido.length !== encabezadoEsperadoNormalizado.length) {
        throw new Error(`Columnas detectadas: ${encabezadoRecibido.length}. Requeridas: ${encabezadoEsperadoNormalizado.length}`);
    }

    const diferencias = encabezadoEsperadoNormalizado.map((v, i) => ({
        Campo: encabezadoEsperado[i],
        Esperado: v,
        Recibido: encabezadoRecibido[i],
        Coincide: v === encabezadoRecibido[i] ? '✅' : '❌'
    }));

    if (diferencias.some(d => d.Coincide === '❌')) {
        console.table(diferencias);
        throw new Error('Error en formato de encabezado');
    }
}

function procesarResultados(contenido) {
    validarFormatoArchivo(contenido);

    const registros = contenido.split('\n')
        .slice(1)
        .map(linea => {
            const campos = linea.replace(/\r/g, '')
                .split('\t')
                .map(c => c.trim());

            if (campos.length < 7) return null;

            return {
                Fecha: campos[0]?.split(' ')[0]?.replace(/\//g, '-') || '',
                Hora: campos[0]?.split(' ')[1] || '',
                Muestra: campos[1]?.replace('R-', '') || '',
                Prueba: campos[2] || '',
                Concentración: campos[4]?.split(' ')[0] || ''
            };
        })
        .filter(item => item !== null);

    const agrupados = registros.reduce((acumulador, actual) => {
        const clave = actual.Muestra;
        if (!acumulador[clave]) acumulador[clave] = [];
        acumulador[clave].push(actual);
        return acumulador;
    }, {});

    return Object.entries(agrupados)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([muestra, registros]) => ({
            Muestra: muestra,
            Registros: registros.sort((a, b) =>
                parseFloat(b.Concentración || 0) - parseFloat(a.Concentración || 0)
            )
        }));
}

function leerArchivo(archivo) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Error al leer archivo'));
        reader.readAsText(archivo, 'Windows-1252');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('archivoInput');
    const uploadButton = document.getElementById('uploadButton');

    uploadButton.addEventListener('click', () => fileInput.click());


    fileInput.addEventListener('change', async () => {
		
	uploadButton.classList.add('active');
        const archivo = fileInput.files[0];
        try {
            if (!archivo) throw new Error('Selecciona un archivo');
            if (!validarExtension(archivo.name)) throw new Error('Solo archivos .txt permitidos');

            const contenido = await leerArchivo(archivo);
            const resultados = procesarResultados(contenido);

            console.table(resultados);

            resultados.forEach(grupo => {
                console.log(`%cMuestra ${grupo.Muestra} (${grupo.Registros.length} pruebas):`, 'font-weight: bold; color: #4CAF50;');
                console.table(grupo.Registros);
            });

            const message = resultados.length > 0
                ? `Procesadas ${resultados.length} muestras`
                : 'No se encontraron registros';

            showNotification(message, resultados.length > 0 ? 'success' : 'info');
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {

            uploadButton.classList.remove('active');
            fileInput.value = ''; // Limpiar la selección del archivo
        }
    });
});
















function mostrarPendientes(v) {
	var tbody = document.getElementById('patientTableBodyPendientes');
	// Crea una nueva fila
	var fila = tbody.insertRow();
	// Crea las celdas y agrega contenido
	if (v.estado == 1) {
		fila.className = "estatus";
	}
	const celda1 = fila.insertCell();
	celda1.innerHTML = v.tipo_cedula + v.cedula;

	const celda2 = fila.insertCell();
	celda2.innerHTML = v.nombre;

	const celda3 = fila.insertCell();
	celda3.innerHTML = v.apellido;

	const celda32 = fila.insertCell();
	celda32.innerHTML = v.sexo;

	const celda4 = fila.insertCell();
	celda4.innerHTML = v.tipo_examen;

	const celda5 = fila.insertCell();
	celda5.innerHTML = v.fecha;

	const celda52 = fila.insertCell();
	celda52.innerHTML = v.hora;


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
		tablaPacienteEliminarExamenes(v.id)
		modal('eliminarExamenesModal');
	};
	const boton3 = document.createElement("button");
	boton3.innerHTML = `<svg viewBox="0 -960 960 960"">
	<path fill="currentColor" d="m520-120 34-331q-57-15-86-39.5T410-544l-95 94 85 85v245h-80v-210l-31-28 7 54-147 189-63-49 126-162-57-112q-8-17-9-42.5t17-43.5l134-132q12-12 26.5-18t29.5-6q24 0 38 9t19 14l80 79q27 27 66 42.5t84 15.5h66q23 0 40 15.5t19 38.5l26 254q13 8 21 21.5t8 30.5q0 25-17.5 42.5T760-100q-25 0-43-17.5T699-160q0-17 8-30.5t22-21.5l-5-48H594l-14 140h-60Zm-20-540q-33 0-56.5-23.5T420-740q0-33 23.5-56.5T500-820q33 0 56.5 23.5T580-740q0 33-23.5 56.5T500-660Zm100 340h118l-14-140h-89l-15 140Z"/>
	</svg>
            <span class="description">Agregar</span> `;
	boton3.className = "action-button agregar-button";
	boton3.type = "button";

	boton3.onclick = function () {
		agregarresultadosFormulario(v.id);

		modal('resultadoPacientesModal');
	};


	celda6.appendChild(boton3);
	celda6.appendChild(boton2);
}




function tablaPendientes() {
	sendRequest('pacientes/filtrarPendiente', {}, response => {
		if (typeof response === 'object') {
			document.getElementById('patientTableBodyPendientes').innerHTML = "";
			response.forEach(mostrarPendientes);
		} else {
			showNotification(resultado.respuesta, "info");
		}
	}).catch(error => {
		showNotification(error.respuesta, 'info');
	});
}


document.getElementById('pacientePendiente').addEventListener('click', () => {
	tablaPendientes();
});








function agregarresultadosFormulario(id) {
	sendRequest('pacientes/ventanaResultados', { id: id }, response => {
		if (typeof response.respuesta === 'object') {

			document.getElementById('span-sexo').innerHTML = response.respuesta.paciente.sexo;
			document.getElementById('span-remitida').innerHTML = response.respuesta.paciente.convenio;
			document.getElementById('span-numero').innerHTML = response.respuesta.paciente.spanNumero;
			document.getElementById('span-nombre').innerHTML = response.respuesta.paciente.spanNombre;
			document.getElementById('span-fecha').innerHTML = response.respuesta.paciente.spanFecha;
			document.getElementById('span-edad').innerHTML = response.respuesta.paciente.spanEdad;
			document.getElementById('span-cedula').innerHTML = response.respuesta.paciente.spanCedula;
			document.getElementById('noteResultadosFormulario').value = '';
			document.getElementById('idPacienteResultadoExamen').value = response.respuesta.paciente.idPaciente;
			document.getElementById('idPacienteResultadRemitida').value = response.respuesta.paciente.remitida;
			document.getElementById('span-nombre-amalista').innerHTML = `${response.respuesta.analista.nombre} ${response.respuesta.analista.apellido}`;
			document.getElementById('span-cargo').innerHTML = response.respuesta.analista.cargos;
			document.getElementById('idExamenesResultados').value = response.respuesta.examenes[0].idExanePaciente;

			document.getElementById('resultadoPacientesServicio').innerHTML = '';
			insertConten({ id: '', nombre: 'servicio..?' }, 'resultadoPacientesServicio');
			response.respuesta.servicios.forEach(servicio => insertConten(servicio, 'resultadoPacientesServicio'));

			document.getElementById('tableCargarResultados').innerHTML = '';

			const tabla = document.getElementById('tableCargarResultados');

			response.respuesta.examenes.forEach(examen => {
				const filaExamen = document.createElement('tr');
				const celdaExamen = document.createElement('td');
				celdaExamen.colSpan = 3; // Ocupa todas las columnas
				celdaExamen.textContent = examen.nombreExamen;
				celdaExamen.style.fontWeight = 'bold'; // Estilo para resaltar
				celdaExamen.style.textAlign = 'center'; // Centrar el texto
				celdaExamen.style.borderTop = '2px solid black'; // Borde superior
				filaExamen.appendChild(celdaExamen);
				tabla.appendChild(filaExamen);

				// Crear una fila para los encabezados de los análisis
				const filaEncabezados = document.createElement('tr');
				const encabezados = ["ANÁLISIS", "VALOR PACIENTE", "VALORES REFERENCIALES"];
				encabezados.forEach(encabezado => {
					const celdaEncabezado = document.createElement('th');
					celdaEncabezado.textContent = encabezado;
					filaEncabezados.appendChild(celdaEncabezado);
				});

				tabla.appendChild(filaEncabezados);

				examen.analisis.forEach(analisis => {
					resultadosFormularioAgregar(analisis, 'tableCargarResultados', examen.idExanePaciente);
				});
			});

			generateQRCodeConsult(response.respuesta.examenes[0].idExanePaciente);

		} else {
			showNotification(response.respuesta, 'info');
		}
	}).catch(error => {
		showNotification(error.respuesta, 'info');
	});
}


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

function tablaPacienteEliminarExamenes(v1) {
	sendRequest('pacientes/consultarAnalisis', { id: v1 }, response => {
		if (response.estatus === 'éxito') {
			document.getElementById('contenedorCheckEliminarExamenes').innerHTML = "";
			response.respuesta.forEach(examen => agregarContenidoTablaEliminarExamenes(examen));
		} else {
			showNotification(response.respuesta, 'info');
		}
	}).catch(error => {
		showNotification(error.respuesta, 'info');
	});
}
function agregarContenidoTablaEliminarExamenes(v) {
	const tbody = document.getElementById('contenedorCheckEliminarExamenes');

	const div = document.createElement("tr");
	div.className = 'checkbox-wrapper';
	if (v.estado == 1) {
		div.className = "checkbox-wrapper estatus";
	} else if (v.estado == 2) {
		div.className = "checkbox-wrapper noneEstatus";
	}
	const checkbox = document.createElement("input");
	checkbox.className = "elimiarExamenesPendientesError check";
	checkbox.type = "checkbox";
	checkbox.name = v.id;
	checkbox.id = `chekcltb${v.id}`;

	const label = document.createElement("label");
	label.htmlFor = `chekcltb${v.id}`;
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



	td.appendChild(checkbox);

	td.appendChild(label);

	td2.className = "none";
	div.appendChild(td);
	div.appendChild(td2);
	tbody.appendChild(div);





}