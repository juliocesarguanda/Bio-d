filtroTabletResultados('searchInputMiscelaneos', 'modalTableBodyMiscelaneos');
filtroTabletResultados('searchInputAnalisis', 'patientTableBodyAnalisis');
filtroTabletResultados('searchInputEditMiscelaneosExiste', 'modalTableBodyEditMiscelaneos');


function agregarContenidoTablaMiscelaneos(v, tabla, valor, classCk) {
    const tbody = document.getElementById(tabla);

    const div = document.createElement("tr");
    div.className = 'checkbox-wrapper';

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = v.id;
    checkbox.className = `${classCk} check`;
    checkbox.id = classCk + v.id;
    checkbox.checked = valor;

    const label = document.createElement("label");
    label.htmlFor = classCk + v.id;;
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

    td.appendChild(checkbox);

    td.appendChild(label);


    td2.className = "none";
    div.appendChild(td);
    div.appendChild(td2);

    tbody.appendChild(div);
}



function selectDeMiscelaneos(ruta, ruta2, table, consulta, classCk, valor, valor2) {
    document.getElementById(table).innerHTML = '';

    sendRequest(ruta, { id: consulta }, response => {
        if (response.estatus === 'éxito' && Array.isArray(response.respuesta)) {
            response.respuesta.forEach(item => {
                agregarContenidoTablaMiscelaneos(item, table, valor, classCk);
            });
        } else {
            showNotification(response.respuesta, 'info');
        }
    }).catch(error => {
        showNotification("Error: " + error.respuesta, 'error');
    });

    sendRequest(ruta2, { id: consulta }, response => {
        if (response.estatus === 'éxito' && Array.isArray(response.respuesta)) {
            response.respuesta.forEach(item => {
                agregarContenidoTablaMiscelaneos(item, table, valor2, classCk);
            });
        } else {
            showNotification(response.respuesta, 'info');
        }
    }).catch(error => {
        showNotification(error.respuesta, 'error');
    });
}

function selectDeMiscelaneos2(ruta, table, consulta, classCk, valor) {
    document.getElementById(table).innerHTML = '';
    sendRequest(ruta, { id: consulta }, response => {
        if (response.estatus === 'éxito' && Array.isArray(response.respuesta)) {
            response.respuesta.forEach(item => {
                agregarContenidoTablaMiscelaneos(item, table, valor, classCk);
            });
        } else {
            showNotification(response.respuesta, 'info');
        }
    }).catch(error => {
        showNotification(error.respuesta, 'info');
    });
}

function vaciarChecks(){
    var checkboxes = document.querySelectorAll('.checkM');
    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            checkbox.checked = false;
        }
    })
}

function selectDeReactivos() {
    sendRequest('configuracion/consultReactivo', {}, response => {
        document.getElementById('reactivoAnalisis').innerHTML = '';
        document.getElementById('reactivoAnalisisEditardata').innerHTML = '';
        if (typeof (response) == "object") {
            let t = {
                id: '',
                nombre: ''
            };
            insertConten(t, 'reactivoAnalisis');
            insertConten(t, 'reactivoAnalisisEditardata');
            response.respuesta.forEach(item => {
                insertConten(item, 'reactivoAnalisis');
                insertConten(item, 'reactivoAnalisisEditardata');
            });
        } else {
            showNotification(response.respuesta, 'info');
        }
    }, 'GET').catch(error => {
        showNotification("Error: " + error.respuesta, 'error');
    });
}


document.getElementById('addPatientButtonAnalisis').addEventListener('click', function () {
    selectDeMiscelaneos2('configuracion/consultMiscelaneo', 'modalTableBodyMiscelaneos', 'consultar', 'checkM', false);
    modal('registrarAnalisisModal');
});

function agregarContenidoTablaAnalisis(v) {
    const tbody = document.getElementById('patientTableBodyAnalisis');
    // Crea una nueva fila
    const fila = tbody.insertRow();

    if (v.reactivoEstatus == 0) {
        fila.className = "noneEstatus";
    }
    // Crea las celdas y agrega contenido
    const celda1 = fila.insertCell();
    celda1.innerHTML = v.nombre;


    const celda2 = fila.insertCell();
    celda2.innerHTML = v.descripcion;
    
    const celda3 = fila.insertCell();
    celda3.innerHTML = v.valor;

    const celda4 = fila.insertCell();
    celda4.innerHTML = v.reactivo;

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
        document.getElementById('nombreAnalisisEditar').value = v.nombre;
        document.getElementById('ValorAnalisisEditar').value = v.valor;
        document.getElementById('valorEditarAnalisisId').value = v.id;
        document.getElementById('descriptionAnalisisEditar').value = v.descripcion;
        document.getElementById('reactivoAnalisisEditardata').value = v.reactivoId;

        document.getElementById('descriptionAnalisisEditar').classList.add('active');
        document.getElementById('nombreAnalisisEditar').classList.add('active');
        document.getElementById('ValorAnalisisEditar').classList.add('active');
        document.getElementById('reactivoAnalisisEditardata').classList.add('active');

        modal('analisisEditModal');
        selectDeMiscelaneos('configuracion/tablaMiscelaneosExistente', 'configuracion/tablaMiscelaneosAnalisis', 'modalTableBodyEditMiscelaneos', v.id, 'checkEditM', true ,false)
        
    };

    const boton2 = document.createElement("button");
    boton2.innerHTML = `<svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg> 
            <span class="description">Eliminar</span>`;
    boton2.className = "action-button delete-button";
    boton2.type = "button";

    boton2.onclick = function () {
        document.getElementById('nombreAnalisisEliminar').textContent = v.nombre;
        document.getElementById('valorEliminarAnalisisId').value = v.id;
        modal('analisisDeleteModal');
    };

    celda6.appendChild(boton);
    celda6.appendChild(boton2);
}

function tablaAnalisis() {
    sendRequest('configuracion/tablaAnalisis', {}, response => {
        if (response.estatus === 'éxito') {
            document.getElementById('patientTableBodyAnalisis').innerHTML = "";
            response.respuesta.forEach(analisis => {
                agregarContenidoTablaAnalisis(analisis);
            });
        } else {
            showNotification(response.respuesta, "info");
        }
    }, 'GET').catch(error => {
        showNotification(error.respuesta, "info");
    });
}



document.getElementById('configuracion').addEventListener('click', () => {
        tablaAnalisis();
        selectDeReactivos();
});
