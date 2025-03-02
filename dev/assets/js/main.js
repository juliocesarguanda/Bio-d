// Recargar la página al cambiar el estado del historial
window.addEventListener('popstate', () => {
    location.reload(); // Recarga la página
    console.log("Página recargada");
});
function formatearFechaISO(fechaISO) {
    const fecha = new Date(fechaISO);
    const year = fecha.getUTCFullYear();
    const month = String(fecha.getUTCMonth() + 1).padStart(2, '0');
    const day = String(fecha.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function sendRequest(url, data, callback, method = 'POST', isPDF = false) {
    try {
        const respuesta = await fetch("http://localhost:3007/" + url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: method === 'POST' ? JSON.stringify(data) : undefined
        });

        if (isPDF) {
            if (!respuesta.ok) {
                return respuesta.json().then(err => { throw new Error(err.respuesta); });
            }
            const blob = await respuesta.blob();
            callback(blob);
        } else {
            const result = await respuesta.json().catch(() => null);
            callback(result);
        }
    } catch (error) {
        callback({ estatus: 'error', respuesta: error.message });
    }
}

function generarPDF(url, data = null) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'http://localhost:3007/' + url;
    form.target = '_blank';
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify(data);
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}




// Función para obtener la fecha formateada
function fecha() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `_${day}-${month}-${year}`;
}

async function checkUserSession() {
    sendRequest('login/session', {}, resultado => {
        if (resultado.estatus === 'éxito') {
            const usuario = resultado.respuesta.usuario;
            const tipoUsuario = resultado.respuesta.tipo;

            if (!usuario || !tipoUsuario) {
                window.location.href = "index.html";
            } else if (tipoUsuario != 1) {
                const elementos = document.querySelectorAll(".admin");
                elementos.forEach(elemento => { elemento.style.display = "none"; });
            }

            document.querySelector('.user-dropdown-header').innerHTML = usuario;
            document.querySelector('.user-circle').innerHTML = usuario[0];
        } else {
            window.location.href = "index.html";
        }
    }, 'GET');
}
function showNotification(title, type) {
    const params = [{
        title: title
    },
        type,
    {
        animate: true,
        isColored: true,
        screenTime: '15000',
        transitionDuration: '500',
        position: 'bottom-right',
        typeAnimation: 'fade-in',
        expand: false,
        theme: 'gradient',
        timeline: true,
        removeOn: 'click'
    }];
    const bell = new Bell(...params);
    bell.launch();
}
checkUserSession();

document.addEventListener('input', function (event) {
    if (event.target.tagName == 'INPUT' && event.target.classList.contains('upperCase')) {
        event.target.value = event.target.value.toUpperCase();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const checkboxes = document.querySelectorAll(".pulsar");
    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener("click", function () {
            this.form.querySelector(".none").click();
        });
    });
});

function contieneCaracter(input, caracter) {
    return input.includes(caracter);
}

function insertConten(v, v2) {
    const selectElement = document.getElementById(v2);
    const newOption = document.createElement('option');
    newOption.value = v.id;
    newOption.text = v.nombre;
    selectElement.appendChild(newOption);
}
function resultadosFormularioAgregar(v, w, x) {


    let unidad = v.valorReferencia.split(" ");

    var tbody = document.getElementById(w);
    // Crea una nueva fila
    var fila = tbody.insertRow();
    // Crea las celdas y agrega contenido
    const celda1 = fila.insertCell();
    celda1.innerHTML = v.nombreAnalisis;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "resultadoPacientes";
    input.name = `${x} ${v.analisisId}`;
    if (unidad[1]) {
        input.value = unidad[1];
    }
    input.maxLength = 20;
    input.required = true;

    const celda2 = fila.insertCell();

    const div = document.createElement("div");

    div.className = "divResultadoPacientesAlert";







    // Crear el botón
    const button = document.createElement('button');
    button.className = 'alert-btn';
    button.type = 'button';
    button.onclick = function () {
        toggleAlert(this);
    };

    // Crear el SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z');

    // Agregar el path al SVG
    svg.appendChild(path);

    // Agregar el SVG al botón
    button.appendChild(svg);

    // Crear el contenedor de entrada
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container-alert';

    // Crear el input
    const input2 = document.createElement('input');
    input2.type = 'text';
    input2.name = `${x} ${v.analisisId}`;
    input2.className = "resultadoPacientesAlert";
    input2.placeholder = 'Ingrese alerta...';
    input2.onchange = function () {
        checkAlertValue(this);
    };

    // Agregar el input al contenedor
    inputContainer.appendChild(input2);

    // Agregar el botón y el contenedor de entrada al cuerpo del documento (o a otro elemento)

    div.appendChild(input);
    div.appendChild(button);
    div.appendChild(inputContainer);
    celda2.appendChild(div);



    const celda3 = fila.insertCell();
    celda3.innerHTML = v.valorReferencia;



    // const fileContainer = document.createElement('div');
    // fileContainer.classList.add('file-container');

    // // Crear input de archivo
    // const fileInput = document.createElement('input');
    // fileInput.type = 'file';
    // fileInput.id = `imageInput${v.id}`;
    // fileInput.classList.add('image-input');
    // fileInput.accept = 'image/*';


    // // Crear SVG del icono de la imagen
    // const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // svgIcon.setAttribute('width', '24');
    // svgIcon.setAttribute('height', '24');
    // svgIcon.setAttribute('viewBox', '0 0 24 24');
    // svgIcon.classList.add('image-icon');
    // svgIcon.addEventListener('click', () => document.getElementById(`imageInput${v.id}`).click());

    // const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    // path2.setAttribute('d', 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');
    // svgIcon.appendChild(path2);
    // svgIcon.style.fill = '#757575';

    // // Crear etiqueta de nombre de archivo
    // const fileNameSpan = document.createElement('span');
    // fileNameSpan.id = `fileName${v.id}`;
    // // Añadir evento para cambiar el color del icono y mostrar el nombre del archivo
    // fileInput.addEventListener('change', function () {
    // 	if (this.files && this.files[0]) {
    // 		svgIcon.style.fill = '#2196F3'; // Cambiar color del icono
    // 		fileNameSpan.textContent = this.files[0].name; // Mostrar el nombre del archivo
    // 	}
    // });
    // // Añadir todos los elementos al contenedor del archivo
    // fileContainer.appendChild(fileInput);
    // fileContainer.appendChild(svgIcon);
    // fileContainer.appendChild(fileNameSpan);

    // // Añadir el contenedor al documento dentro del 

    // const celda4 = fila.insertCell();
    // celda4.appendChild(fileContainer);




}

function validateInputText(input) {
    const value = input.value;
    const regex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/;
    if (!regex.test(value)) {
        input.value = value.slice(0, -1);
    }
}

function validateInputNumero(input) {
    const value = input.value;
    const regex = /^\d*\.?\d*$/;
    if (!regex.test(value) || (value.match(/\./g) || []).length > 1) {
        input.value = value.slice(0, -1);
    }
}

function validateInputNumerot(input) {
    const value = input.value;
    const regex = /^[0-9]*$/;
    if (!regex.test(value)) {
        input.value = value.slice(0, -1);
    }
}

function validateInputCedula(input) {
    const value = input.value;
    const regex = /^[0-9hH-]*$/;
    const hCount = (value.match(/[hH]/g) || []).length;
    const dashCount = (value.match(/-/g) || []).length;

    if (!regex.test(value) || hCount > 1 || dashCount > 1) {
        input.value = value.slice(0, -1);
    }
}

function filtroTabletResultados(input, tabla) {
    document.addEventListener('DOMContentLoaded', function () {
        const searchInput = document.getElementById(input);
        const tableBody = document.getElementById(tabla);
        const rows = tableBody.getElementsByTagName('tr');

        function similarityScore(str1, str2) {
            str1 = str1.toLowerCase();
            str2 = str2.toLowerCase();
            const len = Math.max(str1.length, str2.length);
            let matches = 0;
            for (let i = 0; i < len; i++) {
                if (str1[i] == str2[i]) matches++;
            }
            return matches / len;
        }

        function highlightText(node, search) {
            if (!search) return;
            const regex = new RegExp(`(${search})`, 'gi');
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
            let textNode;
            while (textNode = walker.nextNode()) {
                const parent = textNode.parentNode;
                const highlightedText = textNode.nodeValue.replace(regex, function (match) {
                    return `<span class="highlight">${match}</span>`;
                });
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = highlightedText;
                while (tempDiv.firstChild) {
                    parent.insertBefore(tempDiv.firstChild, textNode);
                }
                parent.removeChild(textNode);
            }
        }

        function removeHighlights(node) {
            const highlights = node.querySelectorAll('.highlight');
            highlights.forEach(span => {
                const parent = span.parentNode;
                parent.replaceChild(document.createTextNode(span.textContent), span);
                parent.normalize();
            });
        }

        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            Array.from(rows).forEach(row => {
                const cells = row.getElementsByTagName('td');
                let maxScore = 0;
                let bestMatch = '';

                Array.from(cells).forEach((cell, index) => {
                    if (index < cells.length - 1) {
                        removeHighlights(cell);
                        const text = cell.textContent.toLowerCase();
                        const score = similarityScore(text, searchTerm);
                        if (score > maxScore) {
                            maxScore = score;
                            bestMatch = cell.textContent;
                        }
                    }
                });

                if (maxScore > 0.3 || bestMatch.toLowerCase().includes(searchTerm)) {
                    row.style.display = '';
                    Array.from(cells).forEach((cell, index) => {
                        if (index < cells.length - 1) {
                            highlightText(cell, searchTerm);
                        }
                    });
                } else {
                    row.style.display = 'none';
                }
            });
        });

    });
}

// Abre un modal
function modal(modalId) {
    if (modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

// Cierra un modal
function modalClose(modalId) {
    if (modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const menuItems = {
        'paciente': document.getElementById('pacienteMenuItem'),
        'caja': document.getElementById('cajaMenuItem'),
        'inventario': document.getElementById('inventarioMenuItem'),
        'estadisticas': document.getElementById('estadisticasMenuItem')
    };
    const sidebars = {
        'paciente': document.getElementById('pacienteSidebar'),
        'caja': document.getElementById('cajaSidebar'),
        'inventario': document.getElementById('inventarioSidebar'),
        'estadisticas': document.getElementById('estadisticasSidebar')
    };
    const contentWrapper = document.querySelector('.content-wrapper');
    const welcomeSection = document.querySelector('.welcome-section');
    const contentSections = document.querySelectorAll('.content-section');
    const userCircle = document.querySelector('.user-circle');
    const userDropdown = document.querySelector('.user-dropdown');
    const notificationBell = document.querySelector('.notification-bell');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    const notificationCount = document.querySelector('.notification-count');

    // Oculta todas las barras laterales
    function hideSidebars() {
        Object.values(sidebars).forEach(sidebar => {
            sidebar.style.left = '-290px';
        });
        contentWrapper.style.marginLeft = '0px';
    }

    // Deselecciona todos los elementos del menú
    function deselectAllMenuItems() {
        Object.values(menuItems).forEach(item => {
            item.classList.remove('selected');
        });
    }

    // Añade eventos de click a los elementos del menú
    Object.entries(menuItems).forEach(([key, menuItem]) => {
        menuItem.addEventListener('click', (event) => {
            event.stopPropagation();
            hideSidebars();
            deselectAllMenuItems();
            menuItem.classList.add('selected');
            sidebars[key].style.left = '0px';
            contentWrapper.style.marginLeft = '250px';
        });
    });

    // Deselecciona todas las opciones de la barra lateral
    function deselectAllSidebarOptions() {
        document.querySelectorAll('.sidebar-option').forEach(option => {
            option.classList.remove('selected');
        });
    }

    // Añade eventos de click a las opciones de la barra lateral
    document.querySelectorAll('.sidebar-option').forEach((option, index) => {
        option.addEventListener('click', function () {
            welcomeSection.classList.add('hidden');
            setTimeout(() => {
                welcomeSection.style.display = 'none';
                contentSections.forEach(section => {
                    section.style.display = 'none';
                    section.classList.remove('active');
                });
                contentSections[index].style.display = 'block';
                contentSections[index].classList.add('active');
            }, 500);
            deselectAllSidebarOptions();
            this.classList.add('selected');
            hideSidebars();
        });
    });

    // Añade eventos de click a los elementos del dropdown de usuario
    document.querySelectorAll('.user-dropdown-item').forEach(item => {
        item.addEventListener('click', function () {
            const text = this.textContent.trim().toLowerCase();
            let modalId;
            if (text.includes('cerrar sesión')) {
                modalId = 'logoutModal';
            } else if (text.includes('configuración')) {
                modalId = 'settingsModal';
            } else if (text.includes('perfil')) {
                modalId = 'profileModal';
            }

            if (modalId) {
                const modal = document.getElementById(modalId);
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
            }
            userDropdown.classList.remove('active');
        });
    });

    // Evento para mostrar el dropdown de usuario
    userCircle.addEventListener('click', function (event) {
        event.stopPropagation();
        if (notificationDropdown.classList.contains('active')) {
            notificationDropdown.classList.remove('active');
            setTimeout(() => {
                notificationDropdown.style.display = 'none';
            }, 300);
        }
        userDropdown.classList.toggle('active');
    });

    // Evento para mostrar el dropdown de notificaciones
    notificationBell.addEventListener('click', function (event) {
        event.stopPropagation();
        if (userDropdown.classList.contains('active')) {
            userDropdown.classList.remove('active');
        }
        notificationDropdown.style.display = 'block';
        void notificationDropdown.offsetWidth; // Trigger reflow
        notificationDropdown.classList.toggle('active');
        notificationCount.style.display = 'none';
        notificationBell.querySelector('svg').className = 'bell-active';
    });

    // Evento para cerrar dropdowns al hacer click fuera de ellos
    document.addEventListener('click', function (event) {
        if (!notificationDropdown.contains(event.target) && event.target !== notificationBell) {
            notificationDropdown.classList.remove('active');
            setTimeout(() => {
                if (!notificationDropdown.classList.contains('active')) {
                    notificationDropdown.style.display = 'none';
                }
            }, 300);
        }
        if (!userDropdown.contains(event.target) && event.target !== userCircle) {
            userDropdown.classList.remove('active');
        }
        if (!Object.values(sidebars).some(sidebar => sidebar.contains(event.target)) &&
            !Object.values(menuItems).some(menuItem => menuItem.contains(event.target))) {
            hideSidebars();
            deselectAllMenuItems();
        }
    });

    // Añade eventos de click para cerrar modales
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    });

    // Añade eventos de click para cerrar modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function () {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    });

    // Evento para cerrar modal al hacer click fuera de él
    window.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal')) {
            const modal = event.target;
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    });

    // Confirmación de cierre de sesión
    document.getElementById('confirmLogout').addEventListener('click', function () {
        sendRequest('login/salir', {}, resultado => {
            if (resultado.estatus === 'éxito') {
                window.location = 'index.html';
            } else {
                console.error('Error al cerrar sesión:', resultado.respuesta);
            }
        });
    });

});
// Añade clase 'active' a los inputs y selects cuando están en foco y la quita cuando están vacíos
document.querySelectorAll('.input-container-text input').forEach(input => {
    input.addEventListener('focus', () => {
        input.classList.add('active');
    });

    input.addEventListener('blur', () => {
        if (input.value === '') {
            input.classList.remove('active');
        }
    });
});

document.querySelectorAll('.input-container-text select').forEach(input => {
    input.addEventListener('focus', () => {
        input.classList.add('active');
    });

    input.addEventListener('blur', () => {
        if (input.value === '') {
            input.classList.remove('active');
        }
    });
});

// Obtiene los checkboxes seleccionados
function obtenerCheckboxSeleccionadosExistentes(v) {
    const checkboxes = document.querySelectorAll(v);
    const seleccionados = [];

    checkboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            seleccionados.push(checkbox.name);
        }
    });
    return seleccionados;
}

// Obtiene nombres y valores de inputs y los guarda en un arreglo
function dataName(clase) {
    const inputsDatos = document.querySelectorAll(clase);
    const arregloDatos = [];

    inputsDatos.forEach(input => {
        const nombre = input.name;
        const valor = input.value;
        arregloDatos.push({ nombre, valor });
    });
    return arregloDatos;
}

// Quita la clase 'active' de todos los elementos de un formulario, excepto los de tipo 'date'
function quitarActive(formmulario) {
    const formu = document.getElementById(formmulario);
    const inputs = formu.querySelectorAll('*');
    inputs.forEach(function (elemento) {
        if (elemento.type !== 'date') {
            elemento.classList.remove('active');
        }
    });
}


























try {

    // Handle form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            promise = Promise.resolve("?");
            if (e.target.id == "registrarPaciente") {

                promise = sendRequest('pacientes/registrarPacientes', {
                    nombre: e.target.nombre.value,
                    apellido: e.target.apellido.value,
                    tipoCedula: e.target.tipoCedula.value,
                    cedula: e.target.cedula.value,
                    fechaNacimiento: e.target.fechaNacimiento.value,
                    convenio: e.target.convenio.value,
                    paciente: e.target.paciente.value,
                    telefono: e.target.telefono.value,
                    sexo: e.target.sexo.value
                }, resultado => {
                    if (resultado.estatus === 'insertar') {
                        tablaPaciente();
                        botonAlert.style.display = "none";
                        document.getElementById('examenParaPaciente').value = resultado.respuesta;
                        tablaPacienteExamen(resultado.respuesta);
                        quitarActive('registrarPaciente');
                        document.getElementById('registrarPaciente').reset();
                        showNotification('Exito al insertar el paciente', 'success');
                        modal('formAnalisisModal');
                    } else if (resultado.estatus === 'actualizar') {
                        tablaPaciente();
                        botonAlert.style.display = "none";
                        document.getElementById('examenParaPaciente').value = resultado.respuesta;
                        tablaPacienteExamen(resultado.respuesta);
                        quitarActive('registrarPaciente');
                        document.getElementById('registrarPaciente').reset();
                        showNotification('Exito al actualizar el paciente', 'success');
                        modal('formAnalisisModal');

                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification(error.respuesta, "info");
                });


            }
            else if (e.target.id == "formAnalisis") {


                promise = sendRequest('pacientes/pendiente', {
                    paciente: document.getElementById('examenParaPaciente').value,
                    examenes: obtenerCheckboxSeleccionadosExistentes('.checkexamenPaciente')
                }, resultado => {
                    if (resultado.estatus == 'exito') {
                        modalClose('formAnalisisModal');
                        showNotification(resultado.respuesta, 'success');
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                });

            } else if (e.target.id == "deletePacientes") {
                promise = sendRequest('pacientes/deletePaciente', {
                    valorIdPacienteDelete: e.target.valorIdPacienteDelete.value
                }, resultado => {
                    if (resultado.estatus == 'exito') {
                        showNotification(resultado.respuesta, 'success');
                        tablaPaciente();
                        modalClose('pacienteDeleteModal');
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification(error.respuesta, 'info');
                });
            }
            else if (e.target.id == "updatePacientes") {
                promise = sendRequest('pacientes/updatePacientes', {
                    nombre: e.target.nombre.value,
                    apellido: e.target.apellido.value,
                    tipoCedula: e.target.tipoCedula.value,
                    cedula: e.target.cedula.value,
                    fechaNacimiento: e.target.fechaNacimiento.value,
                    convenio: e.target.convenio.value,
                    paciente: e.target.paciente.value,
                    telefono: e.target.telefono.value,
                    idUpdate: e.target.idUpdate.value,
                    sexo: e.target.sexo.value
                }, resultado => {
                    if (resultado.estatus == 'exito') {
                        tablaPaciente();
                        showNotification(resultado.respuesta, 'success');
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification('Error: ' + error, 'info');
                });
            }
            else if (e.target.id == "registrarPago") {
                promise = sendRequest('caja/cancelarPago', {
                    tipoPago: e.target.tipoPago.value,
                    cantidadPago: e.target.cantidadPago.value,
                    tipoCedulaPago: e.target.tipoCedulaPago.value,
                    cedulaPago: e.target.cedulaPago.value,
                    nombrePago: e.target.nombrePago.value,
                    apellidoPago: e.target.apellidoPago.value,
                    idPago: e.target.idPago.value,
                    telefonoPago: e.target.telefonoPago.value
                }, resultado => {
                    if (resultado.estatus == 'exito' && resultado.respuesta.faltante > 0) {
                        showNotification('Pago exitoso y te faltó: ' + resultado.respuesta.faltante, 'info');
                        tablaPagosPendientes();
                    } else if (resultado.estatus == 'exito' && resultado.respuesta.sobrante > 0) {
                        showNotification('Pago exitoso y te quedó: ' + resultado.respuesta.sobrante, 'success');
                        facturar(resultado.respuesta.factura);
                        tablaPagosPendientes();
                        modalClose('registrarPagoModal');
                    } else if (resultado.estatus == 'exito') {
                        showNotification('Pago exitoso', 'success');
                        facturar(resultado.respuesta.factura);
                        tablaPagosPendientes();
                        modalClose('registrarPagoModal');
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification(error, 'info');
                });

            }
            else if (e.target.id == "reactivoAgregar") {
                promise = sendRequest('inventario/registrarReactivo', {
                    nombre: e.target.nombre.value,
                    marca: e.target.marca.value,
                    cantidad: e.target.cantidad.value,
                    requerido: e.target.requerido.value
                }, resultado => {
                    if (resultado.estatus === 'éxito') {
                        showNotification(resultado.respuesta, 'success');
                        quitarActive('reactivoAgregar');
                        document.getElementById('reactivoAgregar').reset();
                        tablaReactivo();
                        consultarAlertas();
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification('Error: ' + error.respuesta, 'error');
                });




            }
            else if (e.target.id == "deleteReactivo") {


                promise = sendRequest('inventario/eliminarReactivo', { nombre: e.target.nombre.value }, resultado => {
                    if (resultado.estatus === 'éxito') {
                        showNotification('Éxito al eliminar el reactivo', 'success');
                        selectDeReactivos();
                        consultarAlertas();
                        tablaReactivo();
                        modalClose('reactivoDeleteModal');
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification('Error: ' + error.respuesta, 'info');
                });



            }
            else if (e.target.id == "reactivoIngresar") {
                promise = sendRequest('inventario/nuevoLoteR', {
                    cantidadReactivoIngresar: document.getElementById('cantidadReactivoIngresar').value,
                    valorIngresarReactivoId: document.getElementById('valorIngresarReactivoId').value

                }, resultado => {
                    if (resultado.estatus === 'éxito') {
                        showNotification(resultado.respuesta, 'success');
                        consultarAlertas();
                        tablaReactivo();
                        document.getElementById('cantidadReactivoIngresar').value = '';
                        modalClose('reactivoIngresarModal');

                        selectDeReactivos();
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                });

            }
            else if (e.target.id == "reactivoEdit") {


                promise = sendRequest('inventario/actualizarReactivos', {

                    nombre: e.target.nombre.value,
                    marca: e.target.marca.value,
                    cantidad: e.target.cantidad.value,
                    requerido: e.target.requerido.value,
                    valorEditarReactivoId: e.target.valorEditarReactivoId.value

                }, resultado => {
                    if (resultado.estatus === 'éxito') {
                        showNotification(resultado.respuesta, 'success');
                        selectDeReactivos();
                        tablaReactivo();
                        consultarAlertas();
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                });
            }
            else if (e.target.id == "miscelaneoAgregar") {
                promise = sendRequest('inventario/registrarMiscelaneo', {
                    nombre: e.target.nombre.value,
                    cantidad: e.target.cantidad.value
                }, resultado => {
                    if (resultado.estatus === 'éxito') {
                        showNotification(resultado.respuesta, 'success');
                        quitarActive('miscelaneoAgregar');
                        document.getElementById('miscelaneoAgregar').reset();
                        tablaMiscelaneo();
                        consultarAlertasMiscelaneos();
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification('Error: ' + error.respuesta, 'error');
                });



            }
            else if (e.target.id == "deleteMiscelaneo") {


                promise = sendRequest('inventario/eliminarMiscelaneo', {
                    nombre: e.target.nombre.value
                }, resultado => {
                    if (resultado.estatus === 'éxito') {
                        showNotification(resultado.respuesta, 'success');
                        tablaMiscelaneo();
                        modalClose('miscelaneoDeleteModal');
                        consultarAlertasMiscelaneos();
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification('Error: ' + error.respuesta, 'error');
                });


            }
            else if (e.target.id == "miscelaneoIngresar") {
                promise = sendRequest('inventario/nuevoLoteM', {
                    cantidadMiscelaneoIngresar: document.getElementById('cantidadMiscelaneoIngresar').value,
                    valorIngresarMiscelaneoId: document.getElementById('valorIngresarMiscelaneoId').value
                }, resultado => {
                    if (resultado.estatus === 'éxito') {
                        showNotification('Éxito al actualizar el misceláneo', 'success');
                        consultarAlertasMiscelaneos();
                        tablaMiscelaneo();
                        document.getElementById('cantidadMiscelaneoIngresar').value = "";
                        modalClose('miscelaneoIngresarModal');
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification('Error: ' + error.respuesta, 'error');
                });

            }
            else if (e.target.id == "miscelaneoEdit") {

                promise = sendRequest('inventario/actualizarMiscelaneo', {
                    nombre: e.target.nombre.value,
                    cantidad: e.target.cantidad.value,
                    valorEditarMiscelaneoId: e.target.valorEditarMiscelaneoId.value
                }, resultado => {
                    if (resultado.estatus === 'éxito') {
                        showNotification(resultado.respuesta, 'success');
                        tablaMiscelaneo();
                        consultarAlertasMiscelaneos();
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification('Error: ' + error.respuesta, 'info');
                });

            }
            else if (e.target.id == "analisisAgregar") {


                promise = sendRequest('configuracion/registrarAnalisis', {
                    nombre: e.target.nombre.value,
                    valor: e.target.valor.value,
                    reactivo: e.target.reactivo.value,
                    description: e.target.description.value,
                    checkboxSeleccionados: obtenerCheckboxSeleccionadosExistentes('.checkM')
                }, resultado => {
                    if (resultado.estatus == 'exito') {
                        showNotification(resultado.respuesta, 'success');
                        quitarActive('analisisAgregar');
                        document.getElementById('analisisAgregar').reset();
                        vaciarChecks();
                        consultarAlertas();
                        tablaAnalisis();
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification(error.respuesta, 'info');
                });



            }
            else if (e.target.id == "deleteAnalisis") {

                promise = sendRequest('configuracion/eliminarAnalisis', {
                    nombre: e.target.nombre.value
                }, resultado => {
                    if (resultado.estatus == 'exito') {
                        showNotification('Exito al eliminar el Analisis', 'success');
                        tablaAnalisis();
                        modalClose('analisisDeleteModal');
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification(error.respuesta, 'info');
                });


            }
            else if (e.target.id == "analisisEdit") {

                promise = sendRequest('configuracion/actualizarAnalisis', {
                    nombre: e.target.nombre.value,
                    valor: e.target.valor.value,
                    reactivo: e.target.reactivo.value,
                    description: e.target.description.value,
                    valorEditarAnalisisId: e.target.valorEditarAnalisisId.value,
                    checkEditM: obtenerCheckboxSeleccionadosExistentes('.checkEditM')
                }, resultado => {
                    if (resultado.estatus == 'exito') {
                        showNotification('Exito al actualizar el Analisis', 'success');
                        consultarAlertas();
                        tablaAnalisis();
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification("Error: " + error.respuesta, 'info');
                });

            }
            else if (e.target.id == "resultadoPacientes") {
                promise = sendRequest('pacientes/registrarResultadoPaciente', {
                    idPaciente: e.target.idPaciente.value,
                    remitida: e.target.remitida.value,
                    resultadoPacientes: dataName('input.resultadoPacientes'),
                    note: e.target.note.value,
                    servicio: e.target.servicio.value,
                    resultadoPacientesAlert: dataName('input.resultadoPacientesAlert')
                }, resultado => {
                    if (resultado.estatus === 'falta') {
                        showNotification('Análisis procesado. Esperando pago para exportar a PDF', 'success');
                        modalClose('resultadoPacientesModal');
                        tablaPendientes();
                    } else if (resultado.estatus === 'listo') {
                        showNotification('Análisis procesado', 'success');
                        generarPDF('pacientes/resultado', { idResultado: parseInt(e.target.idExanen.value), qr: e.target.qr.value });
                        modalClose('resultadoPacientesModal');
                        tablaPendientes();
                    } else {
                        showNotification('Error: ' + resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification('Error: ' + error, 'error');
                });
            }
            else if (e.target.id == "resultadoPacientesHistorial") {

                showNotification('Análisis PDF', 'success');
                generarPDF('pacientes/resultado', { idResultado: parseInt(e.target.idExanenl.value), qr: e.target.qrl.value });
            }
            else if (e.target.id == "registrarUsuario") {
                promise = sendRequest('perfil/registrar', {
                    tipoCedula: e.target.tipoCedula.value,
                    cedula: e.target.cedula.value,
                    nombre: e.target.nombre.value,
                    apellido: e.target.apellido.value,
                    usuario: e.target.usuario.value,
                    contrasena: e.target.contrasena.value,
                    cargo: e.target.cargo.value,
                    tipoUsuario: e.target.tipoUsuario.value,
                    correo: e.target.correo.value
                }, resultado => {
                    if (resultado.estatus === 'exito') {
                        showNotification('Éxito al registrar el usuario', 'success');
                        modalClose('registrarUsuarioModal');
                        quitarActive('registrarUsuario');
                        document.getElementById('registrarUsuario').reset();
                        tablaUsuario();
                        analistaTurnoconsultaSelec();
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                });

            }

            else if (e.target.id == "registrarExamenes") {
                if (obtenerCheckboxSeleccionadosExistentes('.checkAnalisisExamen').length != 0) {
                    sendRequest('configuracion/agregarExamenes', {
                        nombre: document.getElementById('examenesInputNombre').value,
                        valor: document.getElementById('examenesInputValue').value,
                        descripcion: e.target.descripcion.value,
                        checkboxSeleccionados: obtenerCheckboxSeleccionadosExistentes('.checkAnalisisExamen')
                    }, respuesta => {
                        if (respuesta.estatus === 'exito') {
                            showNotification(respuesta.respuesta, 'success');
                            modalClose('registrarExamenesModal');
                            document.getElementById('registrarExamenes').reset();
                            tablaExamenes();
                        } else {
                            showNotification(respuesta.respuesta, 'error');
                        }
                    }).catch(error => {
                        showNotification(error.respuesta, 'error');
                    });
                } else {
                    showNotification("Seleccione alguna opción para registrar el análisis", 'info');
                }
            }
            else if (e.target.id == "deleteExamenes") {
                promise = sendRequest('configuracion/eliminarExamenes', {
                    id: e.target.nombre.value
                }, respuesta => {
                    if (respuesta.estatus === 'exito') {
                        showNotification(respuesta.respuesta, 'success');
                        tablaExamenes();
                        modalClose('examenesDeleteModal');
                    } else {
                        showNotification(respuesta.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification(error.respuesta, 'info');
                });

            }
            else if (e.target.id == "editExamenes") {
                promise = Promise.resolve("Operación completada");
                if (obtenerCheckboxSeleccionadosExistentes('.checkExamenEditar').length != 0) {
                    promise = sendRequest('configuracion/editarExamenes', {
                        nombre: document.getElementById('examenesEditInputNombre').value,
                        valor: document.getElementById('examenesEditInputValue').value,
                        descripcion: e.target.descripcion.value,
                        idExamen: e.target.idExamenEditar.value,
                        checkboxSeleccionados: obtenerCheckboxSeleccionadosExistentes('.checkExamenEditar')
                    }, respuesta => {
                        if (respuesta.estatus === 'exito') {
                            showNotification(respuesta.respuesta, 'success');
                            tablaExamenes();
                        } else {
                            showNotification(respuesta.respuesta, 'info');
                        }
                    }).catch(error => {
                        showNotification(error.respuesta, 'info');
                    });
                } else {
                    showNotification("Seleccione alguna opción para registrar el análisis", 'info');
                }
            }
            else if (e.target.id == "registrarPagoFacturaNumero") {
                sendRequest('caja/registrarFactura', {
                    registrarFactura: e.target.registrarFactura.value,
                    paciente: e.target.paciente.value
                }, resultado => {
                    if (resultado.estatus === 'exito') {
                        generarPDF('caja/facturaPDF', { IdFactura: e.target.registrarFactura.value });
                        modalClose('registrarPagoFacturaModal');
                    } else {
                        showNotification('Error: ' + resultado.respuesta, 'error');
                    }
                }).catch(error => {
                    showNotification('Error: ' + error, 'error');
                });
            }
            else if (e.target.id == "formularioParametros") {
                promise = sendRequest('configuracion/actualizarParametros', {
                    numerofactura: e.target.numerofactura.value,
                    precioDolar: e.target.precioDolar.value
                }, respuesta => {
                    if (respuesta.estatus === 'exito') {
                        showNotification(respuesta.respuesta, 'success');
                        inputParametros();
                    } else {
                        showNotification(respuesta.respuesta, 'info');
                        inputParametros();
                    }
                }).catch(error => {
                    showNotification(error.respuesta, 'info');
                });

            }
            else if (e.target.id == "consutarDePagofacturaConsutarNumero") {

                generarPDF('caja/facturaPDF', { IdFactura: e.target.consutarDefactura.value });
                modalClose('registrarPagoFacturaModal');

            }
            else if (e.target.id == "formularioParametrosWhatsAppAp") {
                promise = sendRequest('configuracion/actualizarParametrosWhatsAppAp', {
                    instanceId: e.target.instanceId.value || '',
                    token: e.target.token.value || ''
                }, respuesta => {
                    if (respuesta.estatus === 'exito') {
                        showNotification(respuesta.respuesta, 'success');
                        inputParametrosWhatsAppAp();
                    } else {
                        showNotification(respuesta.respuesta, 'info');
                        inputParametrosWhatsAppAp();
                    }
                }).catch(error => {
                    showNotification(error.respuesta, 'info');
                });

            }
            else if (e.target.id == "updateUsuario") {

                promise = sendRequest('perfil/actualizar', {
                    tipoCedula: e.target.tipoCedula.value,
                    cedula: e.target.cedula.value,
                    nombre: e.target.nombre.value,
                    apellido: e.target.apellido.value,
                    usuario: e.target.usuario.value,
                    contrasena: e.target.contrasena.value,
                    correo: e.target.correo.value,
                    idEmpleado: e.target.idEmpleado.value,
                    idUsuario: e.target.idUsuario.value,
                    cargo: e.target.cargo.value,
                    tipoUsuario: e.target.tipoUsuario.value
                }, resultado => {
                    if (resultado.estatus === 'exito') {
                        showNotification(resultado.respuesta, 'success');
                        tablaUsuario();
                        analistaTurnoconsultaSelec();
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                });
            }
            else if (e.target.id == "deleteUsuarios") {

                promise = sendRequest('perfil/eliminar', {
                    usuario: e.target.valorIdUsuarioDelete.value,
                    empleado: e.target.valorIdEmpleadoDelete.value
                }, respuesta => {
                    if (respuesta.estatus === 'exito') {
                        showNotification(respuesta.respuesta, 'success');
                        modalClose('usuarioDeleteModal');
                        tablaUsuario();
                        analistaTurnoconsultaSelec();
                    } else {
                        showNotification(respuesta.respuesta, 'info');
                    }
                });
            }
            else if (e.target.id == "formularioParametrosFeriado") {

                promise = sendRequest('inicio/actualizarFeriado', {
                    data: document.getElementById('classCkIdvalue').checked
                }, respuesta => {
                    showNotification(respuesta.respuesta, respuesta.estatus === 'éxito' ? 'success' : 'info');

                    if (respuesta.estatus === 'éxito') {
                        consultarFeriados();
                    }
                }).catch(error => {
                    showNotification(error.respuesta, 'info');
                });



            }
            else if (e.target.id == "formularioParametrosFeriado2") {

                promise = sendRequest('inicio/actualizarFeriado', {
                    data: document.getElementById('classCkIdvalue2').checked
                }, respuesta => {
                    showNotification(respuesta.respuesta, respuesta.estatus === 'éxito' ? 'success' : 'info');

                    if (respuesta.estatus === 'éxito') {
                        consultarFeriados();
                    }
                }).catch(error => {
                    showNotification(error.respuesta, 'info');
                });



            }
            else if (e.target.id == "eliminarExamenes") {
                promise = sendRequest('pacientes/eliminarAnalisis', { nombre: obtenerCheckboxSeleccionadosExistentes('.elimiarExamenesPendientesError') }, resultado => {
                    if (resultado.estatus === 'exito') {
                        showNotification(resultado.respuesta, 'success');
                        tablaPendientes();
                        modalClose('eliminarExamenesModal');
                    } else {
                        showNotification(resultado.respuesta, 'info');
                    }
                }).catch(error => {
                    showNotification('Error: ' + error, 'info');
                });

            }




            const state = {
                pending: "procesando",
                success: "procesado",
                error: "Ups. algo paso"
            }

            const bell = new Bell({
                title: "precesos"
            }, "promise", {
                position: "bottom-left"
            })

            bell.promise(promise, state);

            console.log(e.target.id);
        });
    });

} catch (error) {
    reportError(error.message, 'main.js', e.target, e.target.id);
}








