
filtroTabletResultados('searchInputcontenedorPrecios', 'contenedorCheckPreciosExa');

function tablaPreciosExamen() {
    sendRequest('precios/consultarExamen', {}, response => {
        if (response.estatus === 'éxito') {
            document.getElementById('contenedorCheckPreciosExa').innerHTML = "";
            response.respuesta.forEach(examen => {
                agregarContenidoTablaPreciosExamen(examen, 'contenedorCheckPreciosExa', "checkComboPrecios check");
            });
        } else {
            showNotification(response.respuesta, 'info');
        }
    }).catch(error => {
        showNotification( error.respuesta, 'info');
    });
}


function agregarContenidoTablaPreciosExamen(v, tabla, clase) {
	const tbody = document.getElementById(tabla);

	const div = document.createElement("tr");
	div.className = 'checkbox-wrapper';

	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.className = clase;
	checkbox.id = `chekcE${v.id}`;
	checkbox.checked = false;

	const label = document.createElement("label");
	label.htmlFor = `chekcE${v.id}`;
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
	label.appendChild(document.createTextNode(`${v.nombre}`));
	const td2 = document.createElement("td");
	const td3 = document.createElement("td");
	const td4 = document.createElement("td");
	const td5 = document.createElement("td");
	td5.className = 'none';
	td3.innerHTML = v.descripcion;
	td4.innerHTML = v.precio;
	
	// AGREGADO POR RICARDO////////////////////////////////////////////

	const inputPrecio = document.createElement("input");
	inputPrecio.type = "hidden";
	inputPrecio.value = v.precio;
	inputPrecio.id = v.id;

	td2.appendChild(inputPrecio);
	td2.appendChild(checkbox);
	td2.appendChild(label);

	div.appendChild(td2);
	div.appendChild(td3);
	div.appendChild(td4);
	div.appendChild(td5);
	tbody.appendChild(div);



	checkbox.addEventListener("click", () => {

		const totalSpan = document.querySelector(".span-total-e");
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
document.getElementById('buscarExamenesPrecios').addEventListener('click', () => {
		tablaPreciosExamen();
		document.querySelector(".span-total-e").innerText = '0';
		modal('preciosExamenes');
});
