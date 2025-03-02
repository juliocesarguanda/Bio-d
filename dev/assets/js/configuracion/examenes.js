
filtroTabletResultados('searchInputExamenes', 'configTableBodyExamens');

filtroTabletResultados('searchInputAnalisisAgrear', 'modalTableBodyAnalisis');

filtroTabletResultados('searchInputExamenesEditar', 'modalTableBodyEditExamenes');

function agregarContenidoTablaPacienteExamenes(v, tabla) {
    const tbody = document.getElementById(tabla);

    const div = document.createElement("tr");
    div.className = 'checkbox-wrapper';

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = v.id;
    checkbox.className = "checkAnalisisExamen check";
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
    label.appendChild(document.createTextNode(v.nombre + ' ' + v.descripcion));

    const td = document.createElement("td");
    const td2 = document.createElement("td");
    td2.innerHTML = v.descripcion;
    td.appendChild(checkbox);

    td.appendChild(label);



    div.appendChild(td);
    div.appendChild(td2);
    tbody.appendChild(div);
}

function agregarContenidoTablaPacienteExamenesExistente(v, tabla, valor) {
    const tbody = document.getElementById(tabla);

    const div = document.createElement("tr");
    div.className = 'checkbox-wrapper';

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = v.id;
    checkbox.className = "checkExamenEditar check";
    checkbox.id = `chekcEdit${v.id}`;
    checkbox.checked = valor;

    const label = document.createElement("label");
    label.htmlFor = `chekcEdit${v.id}`;
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
    label.appendChild(document.createTextNode(v.nombre + ' ' + v.descripcion));

    const td = document.createElement("td");
    const td2 = document.createElement("td");

    td2.innerHTML = v.descripcion;
    td.appendChild(checkbox);

    td.appendChild(label);


    div.appendChild(td);
    div.appendChild(td2);

    tbody.appendChild(div);
}

function selectDeExmanes(ruta, table, consulta) {
    sendRequest(ruta, { id: consulta }, response => {
        document.getElementById(table).innerHTML = '';

        if (response.estatus === 'éxito' && Array.isArray(response.respuesta)) {
            response.respuesta.forEach(item => {
                agregarContenidoTablaPacienteExamenes(item, table);
            });
        } else {
            showNotification(response.respuesta, 'info');
        }
    }).catch(error => {
        showNotification(error.respuesta, 'error');
    });
}

function selectDeExmanesExiste(ruta, ruta2, tabla, consulta, valor, valor2) {
    document.getElementById(tabla).innerHTML = '';

    sendRequest(ruta, { id: consulta }, response => {
        if (response.estatus === 'éxito' && Array.isArray(response.respuesta)) {
            response.respuesta.forEach(item => {
                agregarContenidoTablaPacienteExamenesExistente(item, tabla, valor);
            });
        } else {
            showNotification(response.respuesta, 'info');
        }
    }).catch(error => {
        showNotification(error.respuesta, 'error');
    });

    sendRequest(ruta2, { id: consulta }, response => {
        if (response.estatus === 'éxito' && Array.isArray(response.respuesta)) {
            response.respuesta.forEach(item => {
                agregarContenidoTablaPacienteExamenesExistente(item, tabla, valor2);
            });
        } else {
            showNotification(response.respuesta, 'info');
        }
    }).catch(error => {
        showNotification(error.respuesta, 'error');
    });
}





document.getElementById('addPatientButtonExamenes').addEventListener('click', function () {
    selectDeExmanes('configuracion/consultarAnalisis', 'modalTableBodyAnalisis', 'consultar');
    modal('registrarExamenesModal');
});
function agregarContenidoTablaExamenes(v) {
    const tbody = document.getElementById('configTableBodyExamens');
    // Crea una nueva fila
    const fila = tbody.insertRow();

    if (v.reactivoEstatus == 0) {
        fila.className = "noneEstatus";
    }
    // Crea las celdas y agrega contenido
    const celda1 = fila.insertCell();
    celda1.innerHTML = v.nombre;

    const celda12 = fila.insertCell();
    celda12.innerHTML = v.descripcion;

    const celda2 = fila.insertCell();
    celda2.innerHTML = v.precio;

    const celda6 = fila.insertCell();
    celda6.className = "action-buttons";

    const boton = document.createElement("button");
    boton.innerHTML = `<svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg> 
            <span class="description">Editar</span>`;
    boton.className = "action-button edit-button";
    boton.type = "button";
    boton.onclick = function () {
        document.getElementById('examenesEditInputNombre').value = v.nombre;
        document.getElementById('examenesEditInputValue').value = v.precio;
        document.getElementById('valorEditarExamenesId').value = v.id;
        document.getElementById('descripcionEditar').value = v.descripcion;

        document.getElementById('examenesEditInputNombre').classList.add('active');
        document.getElementById('examenesEditInputValue').classList.add('active');
        document.getElementById('descripcionEditar').classList.add('active');
        modal('editExamenesModal');
        selectDeExmanesExiste('configuracion/tablaExamenesExistentes', 'configuracion/tablaExamenesEdit', 'modalTableBodyEditExamenes', v.id, true, false)


    };

    const boton2 = document.createElement("button");
    boton2.innerHTML = `<svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg> 
            <span class="description">Eliminar</span>`;
    boton2.className = "action-button delete-button";
    boton2.type = "button";

    boton2.onclick = function () {
        document.getElementById('nombreExamenesEliminar').textContent = v.nombre;
        document.getElementById('valorEliminarExamenesId').value = v.id;
        modal('examenesDeleteModal');
    };

    celda6.appendChild(boton);
    celda6.appendChild(boton2);
}

function tablaExamenes() {
    sendRequest('configuracion/tablaExamenes', { consulta: 'consulta' }, response => {
        if (response.estatus === 'éxito') {
            document.getElementById('configTableBodyExamens').innerHTML = "";
            response.respuesta.forEach(examen => {
                agregarContenidoTablaExamenes(examen);
            });
        } else {
            showNotification(response.respuesta, 'error');
        }
    }).catch(error => {
        showNotification("Error: " + error.respuesta, 'error');
    });
}
document.getElementById('configuracion').addEventListener('click', () => {
        tablaExamenes();
});

