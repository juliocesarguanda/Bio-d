filtroTabletResultados('searchInputPagosFacturas', 'tableBodyPagosFacturas');

function DatosTableBodyPagosFacturas() {
    sendRequest("caja/consultarCierreCaja", { }, response => {
        if (response.estatus === 'éxito') {
            document.getElementById('tableBodyPagosFacturas').innerHTML = "";
            response.respuesta.forEach(item => insertContenTableBodyPagosFacturas(item));
        } else {
            showNotification(response.respuesta, 'info');
        }
    }).catch(error => {
        showNotification("Error: " + error, 'error');
    });
}


function DatosPagosFacturasTotales() {
    sendRequest("caja/consultarCierreCajaTotales", { }, response => {
        if (response.estatus === 'éxito') {
            const data = response.respuesta;

            if (data.facturadoCantidad > 0) {
                document.getElementById('totalPagos').innerHTML = data.facturadoTotal;
                document.getElementById('totalPacientes').innerHTML = data.facturadoCantidad;
                document.getElementById('facturado').className = 'contenedorCierreCajaDivActive';
            } else {
                document.getElementById('facturado').className = 'contenedorCierreCajaDiv';
            }

            if (data.noFacturadoCantidad > 0) {
                document.getElementById('totalPagosNoFacturado').innerHTML = data.noFacturadoTotal;
                document.getElementById('totalPacientesNoFacturado').innerHTML = data.noFacturadoCantidad;
                document.getElementById('noFacturado').className = 'contenedorCierreCajaDivActive';
            } else {
                document.getElementById('noFacturado').className = 'contenedorCierreCajaDiv';
            }
        } else {
            showNotification(response.respuesta, 'error');
        }
    }).catch(error => {
        showNotification("Error: " + error, 'error');
    });
}



function insertContenTableBodyPagosFacturas(v) {
	var tbody = document.getElementById('tableBodyPagosFacturas');
	// Crea una nueva fila
	var fila = tbody.insertRow();
	// Crea las celdas y agrega contenido
	const celda1 = fila.insertCell();
	celda1.innerHTML = formatearFechaISO(v.fecha);

	const celda2 = fila.insertCell();
	celda2.innerHTML = v.factura;

	const celda3 = fila.insertCell();
	celda3.innerHTML = v.razonSocialNombre;

	const celda4 = fila.insertCell();
	celda4.innerHTML = v.razonSocialTipoCedula + v.razonSocialCedula;

	const celda5 = fila.insertCell();
	celda5.innerHTML = v.totalFacturaBs;

	const celda52 = fila.insertCell();
	celda52.innerHTML = v.analista;

	const celda6 = fila.insertCell();
	celda6.className = "action-buttons";



	const boton = document.createElement("button");
	boton.innerHTML = `<svg viewBox="0 -960 960 960"">
	<path fill="currentColor" d="M240-80q-50 0-85-35t-35-85v-120h120v-560l60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-560H320v440h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h240v80H360Zm0 120v-80h240v80H360Zm320-120q-17 0-28.5-11.5T640-640q0-17 11.5-28.5T680-680q17 0 28.5 11.5T720-640q0 17-11.5 28.5T680-600Zm0 120q-17 0-28.5-11.5T640-520q0-17 11.5-28.5T680-560q17 0 28.5 11.5T720-520q0 17-11.5 28.5T680-480ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm-40 0v-80 80Z"/></svg>
            <span class="description">Factura</span> `;
	boton.className = "action-button agregar-button";
	boton.type = "button";
	boton.onclick = function () {

		consultarFactura(v.idFactura);
	};

	celda6.appendChild(boton);
}

document.getElementById('cierre_caja').addEventListener('click', () => {
	DatosPagosFacturasTotales();
	DatosTableBodyPagosFacturas();
});



document.getElementById('cierreCajaFacturadoTodo').addEventListener('click', () => {
    generarPDF('caja/cierreCajaFacturadoTodo');
});
document.getElementById('cierreCajaFacturado').addEventListener('click', () => {
    generarPDF('caja/cierreCajaFacturado');
});



function consultarFactura(id) {
    sendRequest('caja/factura', { IdFactura: id }, response => {
        if (typeof response.respuesta === "object") {
            consultarPagoFactura(response.respuesta);
            modal('consutafacturaConsutarPagoModal');
        } else {
            showNotification(response.respuesta, 'info');
        }
    }).catch(error => {
        showNotification(error, 'info');
    });
}

function consultarPagoFactura(v) {
	document.getElementById('consutarDefacturaConsutarNumero').value = v.idFactura;
	document.getElementById('registrarFacturaNumeroPaciente').value = v.idPaciente;
	document.getElementById('facturaConsutarNumeroPaciente').innerHTML = v.numeroPaciente;
	document.getElementById('facturaConsutarMontoDivisa').innerHTML = v.montoDivisa;
	document.getElementById('facturaConsutarMontoBs').innerHTML = v.totalFacturaBs;
	document.getElementById('facturaConsutarSubTotal').innerHTML = v.totalFacturaBs;
	document.getElementById('facturaConsutarDescuento').innerHTML = v.descuento;
	document.getElementById('facturaConsutarTasa').innerHTML = v.tasa;
	document.getElementById('facturaConsutarTotal').innerHTML = v.total;
	document.getElementById('facturaConsutarNombrePaciente').innerHTML = v.nombrePaciente;
	document.getElementById('facturaConsutarCedulaPaciente').innerHTML = v.tipoCedulaPaciente + v.cedulaPaciente;
	document.getElementById('facturaConsutarRazonSocial').innerHTML = v.razonSocialNombre;
	document.getElementById('facturaConsutarRazonSocialCedula').innerHTML = v.razonSocialTipoCedula + v.razonSocialCedula;
	document.getElementById('facturaConsutarfacturaConsutar').innerHTML = v.factura;
	document.getElementById('facturaConsutarTelefono').innerHTML = v.numeroTelefonoPaciente;
	document.getElementById('facturaConsutarConvenio').innerHTML = v.convenioPaciente;

	document.getElementById('facturaConsutarFecha').innerHTML = v.fecha;
	document.getElementById('facturaConsutarPorsentaje').innerHTML = v.descuentoProsentaje;
	document.getElementById('facturaConsutarDireccion').innerHTML = v.direccion;

	document.getElementById('facturaConsutarFormaPago').innerHTML = '<div><strong class="payment-methodsStrong0 bold">FORMA DE PAGO:</strong> <strong class="payment-methodsStrong2"></strong></div>';
	document.getElementById('facturaConsutarExamenesTbody').innerHTML = '';
	for (let index = 0; index < v.formasPago.length; index++) {
		let div = document.createElement("div");

		let strong0 = document.createElement("strong");
		let strong1 = document.createElement("strong");

		strong0.className = "payment-methodsStrong0";
		strong1.className = "payment-methodsStrong2";

		strong0.innerHTML = v.formasPago[index].nombre;
		if (v.formasPago[index].id == v.formaPago) {
			strong1.innerHTML = 'X';
		} else {
			strong1.innerHTML = '';
		}
		div.appendChild(strong0);
		div.appendChild(strong1);
		document.getElementById('facturaConsutarFormaPago').appendChild(div);

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
		td1.innerHTML = v.examenes[index].nombre_examen;
		td2.innerHTML = v.examenes[index].precio;
		td3.innerHTML = v.examenes[index].monto;

		tr.appendChild(td0);
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		document.getElementById('facturaConsutarExamenesTbody').appendChild(tr);
	}
}
