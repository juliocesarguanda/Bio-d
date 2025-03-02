

filtroTabletResultados('searchInputPagos', 'patientTableBodyPagos');
function DatosRegistrarTipoCedulaPagos() {
    sendRequest('pacientes/consultDatosRegistrarPacientes', {}, response => {
        if (response.estatus === 'éxito') {
            document.getElementById('tipoCedulaPago').innerHTML = "";
            let t = { id: '', nombre: '' };
            insertConten(t, 'tipoCedulaPago');
            response.respuesta.tipoCedula.forEach(item => insertConten(item, 'tipoCedulaPago'));
        } else {
            showNotification(response.respuesta, 'info');
        }
    }, 'GET').catch(error => {
        showNotification(error.respuesta, 'info');
    });
}




function mostrarPagosPendientes(v) {
	var tbody = document.getElementById('patientTableBodyPagos');
	// Crea una nueva fila
	var fila = tbody.insertRow();
	// Crea las celdas y agrega contenido
	const celda1 = fila.insertCell();
	celda1.innerHTML = v.tipo_cedula + v.cedula;

	const celda2 = fila.insertCell();
	celda2.innerHTML = v.nombre;

	const celda3 = fila.insertCell();
	celda3.innerHTML = v.apellido;

	const celda4 = fila.insertCell();
	celda4.innerHTML = v.tipo_examen;

	const celda5 = fila.insertCell();
	celda5.innerHTML = v.total_precio_bs;

	const celda52 = fila.insertCell();
	celda52.innerHTML = v.total_abonado_bs;

	const celda53 = fila.insertCell();
	celda53.innerHTML = v.restante_bs;

	const celda6 = fila.insertCell();
	celda6.className = "action-buttons";



	const boton3 = document.createElement("button");
	boton3.innerHTML = `<svg viewBox="0 -960 960 960"">
	<path fill="currentColor" d="m520-120 34-331q-57-15-86-39.5T410-544l-95 94 85 85v245h-80v-210l-31-28 7 54-147 189-63-49 126-162-57-112q-8-17-9-42.5t17-43.5l134-132q12-12 26.5-18t29.5-6q24 0 38 9t19 14l80 79q27 27 66 42.5t84 15.5h66q23 0 40 15.5t19 38.5l26 254q13 8 21 21.5t8 30.5q0 25-17.5 42.5T760-100q-25 0-43-17.5T699-160q0-17 8-30.5t22-21.5l-5-48H594l-14 140h-60Zm-20-540q-33 0-56.5-23.5T420-740q0-33 23.5-56.5T500-820q33 0 56.5 23.5T580-740q0 33-23.5 56.5T500-660Zm100 340h118l-14-140h-89l-15 140Z"/>
	</svg>
            <span class="description">Pagar</span> `;
	boton3.className = "action-button agregar-button";
	boton3.type = "button";
	boton3.onclick = function () {
		
		quitarActive('registrarPago');
		document.getElementById('registrarPago').reset();

		document.getElementById('cantidadPago').className = 'active';
		document.getElementById('tipoPago').value = '';
		document.getElementById('cantidadPago').value = '';
		document.getElementById('decriptionDelPago').innerText = v.nombre + ' ' + v.apellido + ' CI: ' + v.tipo_cedula + v.cedula;
		document.getElementById('examenDelPago').innerText = v.tipo_examen;
		document.getElementById('restanteDelPago').innerText = v.restante_bs;
		document.getElementById('cantidadPago').value = v.restante_bs;
		document.getElementById('idPago').value = v.id_paciente;


		if (contieneCaracter(v.cedula, 'H') == false) {
			document.getElementById('tipoCedulaPago').value = v.tipo_cedula_id;
			document.getElementById('nombrePago').value = v.nombre;
			document.getElementById('apellidoPago').value = v.apellido;
			document.getElementById('cedulaPago').value = v.cedula;

			document.getElementById('telefonoPago').value = v.telefono;
			document.getElementById('telefonoPago').className = 'active';

			document.getElementById('nombrePago').className = 'active';
			document.getElementById('apellidoPago').className = 'active';
			document.getElementById('cedulaPago').className = 'active';
			document.getElementById('tipoCedulaPago').className = 'active';
		}
		
		modal('registrarPagoModal');
	};

	celda6.appendChild(boton3);
}


function insertContenPagos(v, v2) {
	const selectElement = document.getElementById(v2);

	const newOption = document.createElement('option');
	newOption.value = v.id;
	newOption.text = v.nombre;
	selectElement.appendChild(newOption);

}
function tablaPagosPendientes() {
    sendRequest('caja/cajaPendiente', {}, response => {
        if (typeof response === 'object') {
            document.getElementById('patientTableBodyPagos').innerHTML = "";
            response.forEach(mostrarPagosPendientes);
        } else {
            showNotification(response.respuesta, 'info');
        }
    }).catch(error => {
        showNotification(error.respuesta, 'info');
    });
}




function tipoPago() {
    sendRequest('caja/tipoPago', {}, response => {
        if (typeof response === 'object') {
            document.getElementById('tipoPago').innerHTML = "";
            let t = { id: '', nombre: '' };
            insertContenPagos(t, 'tipoPago');
            response.forEach(item => insertContenPagos(item, 'tipoPago'));
        } else {
            showNotification(response.respuesta, 'info');
        }
    }).catch(error => {
        showNotification("Error: " + error, 'error');
    });
}



function pagoFactura(v) {
	document.getElementById('registrarFacturaNumero').value = v.idFactura;
	document.getElementById('registrarFacturaNumeroPaciente').value = v.idPaciente;
	document.getElementById('facturaRazonSocial').innerHTML = v.razonSocialNombre;
	document.getElementById('facturaRazonSocialCedula').innerHTML = v.razonSocialTipoCedula+v.razonSocialCedula;
	document.getElementById('facturaNombrePaciente').innerHTML = v.nombrePaciente;
	document.getElementById('facturaCedulaPaciente').innerHTML = v.tipoCedulaPaciente+v.cedulaPaciente;
	document.getElementById('facturaFecha').innerHTML = v.fecha;
	document.getElementById('facturaFactura').innerHTML = v.factura;
	document.getElementById('facturaNumeroPaciente').innerHTML = v.numeroPaciente;
	document.getElementById('facturaTasa').innerHTML = v.tasa;
	document.getElementById('facturaMontoBs').innerHTML = v.totalFacturaBs;
	document.getElementById('facturaMontoDivisa').innerHTML = v.montoDivisa;
	document.getElementById('facturaSubTotal').innerHTML = v.totalFacturaBs;
	document.getElementById('facturaDescuento').innerHTML = v.descuento;
	document.getElementById('facturaTotal').innerHTML = v.total;
	document.getElementById('facturaPorsentaje').innerHTML = v.descuentoProsentaje;
	document.getElementById('facturaDireccion').innerHTML = v.direccion;
	document.getElementById('facturaTelefono').innerHTML = v.numeroTelefonoPaciente;
	document.getElementById('facturaConvenio').innerHTML = v.convenioPaciente;

	document.getElementById('facturaFormaPago').innerHTML = '<div><strong class="payment-methodsStrong0 bold">FORMA DE PAGO:</strong> <strong class="payment-methodsStrong2"></strong></div>';
	document.getElementById('facturaExamenes').innerHTML = '';
	for (let index = 0; index < v.formasPago.length; index++) {
		let div = document.createElement("div");
		
		let strong0 = document.createElement("strong");
		let strong1 = document.createElement("strong");

		strong0.className = "payment-methodsStrong0";
		strong1.className = "payment-methodsStrong2";

		strong0.innerHTML =v.formasPago[index].nombre;
		if (v.formasPago[index].id == v.formaPago) {
		strong1.innerHTML = 'X';
		}else{
		strong1.innerHTML ='';
		}
		div.appendChild(strong0);
		div.appendChild(strong1);
		document.getElementById('facturaFormaPago').appendChild(div);

	}

	
	
	
	for (let index = 0; index < v.examenes.length; index++) {
		let tr = document.createElement("tr");
		let td0 = document.createElement("td");
		let td1 = document.createElement("td");
		let td2 = document.createElement("td");
		let td3 = document.createElement("td");
		td0.className = "center";
		td2.className = "right";
		td3.className = "right";

		td0.innerHTML = v.examenes[index].cantidad;
		td1.innerHTML= v.examenes[index].nombre_examen;
		td2.innerHTML= v.examenes[index].precio;
		td3.innerHTML=v.examenes[index].monto;

		tr.appendChild(td0);
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		document.getElementById('facturaExamenes').appendChild(tr);
	}
}


document.getElementById('pendiente_caja').addEventListener('click', () => {
		tablaPagosPendientes();
		tipoPago();
		DatosRegistrarTipoCedulaPagos();
});




function facturar(ids) {
    sendRequest('caja/facturar', { id: ids }, resultado => {
        if (resultado.estatus === 'exito') {
            pagoFactura(resultado.respuesta);
            modal('registrarPagoFacturaModal');
        } else {
            showNotification(resultado.respuesta, 'info');
        }
    });

}

function consultRazonSocial() {
    consultar("src/servicios/caja/razonSocial.php", [document.getElementById('tipoCedulaPago').value, document.getElementById('cedulaPago').value])
        .done(function (response) {
            if ((typeof (response) == "object") && (response[0] != "n")) {
                document.getElementById('nombrePago').value = response['nombre'];
                document.getElementById('apellidoPago').value = response['apellido'];
                document.getElementById('telefonoPago').value = response['telefono'];


                document.getElementById('nombrePago').className = 'active';
                document.getElementById('apellidoPago').className = 'active';
                document.getElementById('telefonoPago').className = 'active';
            }
        })
        .fail(function (xhr, status, error) {
            const options = [{
                "title": "Error: " + error,
                "description": null
            }, "error", {
                "animate": true,
                "isColored": true,
                "transitionDuration": 500,
                "position": "top-right",
                "typeAnimation": "ease-in-out",
                "timeScreen": 50000,
                "expand": true
            }];
            const bell = new Bell(...options).launch();
        });
}



document.getElementById("cedulaPago")?.addEventListener("keyup", consultRazonSocial);
document.getElementById("tipoCedulaPago")?.addEventListener("change", consultRazonSocial);