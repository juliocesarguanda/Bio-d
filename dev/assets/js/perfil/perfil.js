function DatosRegistrarUsuario() {
    sendRequest('perfil/select', {}, response => {
        if (response.estatus === 'éxito') {
            let t = { id: '', nombre: '' };

            document.getElementById('tipoCedulaUpdateUsuario').innerHTML = "";
            document.getElementById('tipoCedulaUpdateUsuario').classList.add("active");

            document.getElementById('cargoUpdateUsuario').innerHTML = "";
            document.getElementById('tipoUpdateUsuario').innerHTML = "";
            document.getElementById('cargoUpdateUsuario').classList.add("active");
            document.getElementById('tipoUpdateUsuario').classList.add("active");

            document.getElementById('tipoUsuario').innerHTML = "";
            document.getElementById('cargoUsuario').innerHTML = "";
            document.getElementById('tipoCedulaUsuario').innerHTML = "";

            insertConten(t, 'tipoUsuario');
            response.respuesta.tipoUsuario.forEach(item => insertConten(item, 'tipoUsuario'));
            response.respuesta.tipoUsuario.forEach(item => insertConten(item, 'tipoUpdateUsuario'));

            insertConten(t, 'cargoUsuario');
            response.respuesta.cargo.forEach(item => insertConten(item, 'cargoUsuario'));
            response.respuesta.cargo.forEach(item => insertConten(item, 'cargoUpdateUsuario'));

            insertConten(t, 'tipoCedulaUsuario');
            response.respuesta.tipoCedula.forEach(item => insertConten(item, 'tipoCedulaUsuario'));
            response.respuesta.tipoCedula.forEach(item => insertConten(item, 'tipoCedulaUpdateUsuario'));
        } else {
            showNotification(response.respuesta, 'info');
        }
    }, 'GET').catch(error => {
        showNotification('Error: ' + error.respuesta, 'info');
    });
}

function tablaUsuario() {
    sendRequest('perfil/consultar', {}, resultado => {
        if (resultado.estatus === 'éxito') {
            if (typeof (resultado.respuesta) === "object") {
                document.getElementById("tableBodyusuarios").innerHTML = "";
                for (let index = 0; index < resultado.respuesta.length; index++) {
                    mostrarUsuarios(resultado.respuesta[index]);
                }
            }
        } else {
            showNotification(resultado.respuesta, 'info');
        }
    });
}

DatosRegistrarUsuario();
filtroTabletResultados('searchInputusuarios', 'tableBodyusuarios');

function mostrarUsuarios(v) {
        var tbody = document.getElementById('tableBodyusuarios');
        // Crea una nueva fila
        var fila = tbody.insertRow();

        // Crea las celdas y agrega contenido
        const celda1 = fila.insertCell();
        celda1.innerHTML = v.nombre_usuario;

        const celda2 = fila.insertCell();
        celda2.innerHTML = v.correo;

        const celda3 = fila.insertCell();
        celda3.innerHTML = v.tipo_cedula + v.cedula;

        const celda4 = fila.insertCell();
        celda4.innerHTML = v.nombre;

        const celda5 = fila.insertCell();
        celda5.innerHTML = v.apellido;

        const celda52 = fila.insertCell();
        celda52.innerHTML = v.cargo;

        const celda53 = fila.insertCell();
        celda53.innerHTML = v.tipo_usuario;

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
            document.getElementById('nombreUsuarioDelete').innerHTML = v.nombre + ' ' + v.apellido + ' Cédula: ' + v.tipo_cedula + v.cedula;
            document.getElementById('valorIdEmpleadoDelete').value = v.id_empleado;
            document.getElementById('valorIdUsuarioDelete').value = v.id_usuario;
            modal('usuarioDeleteModal');
        };

        const boton3 = document.createElement("button");
        boton3.innerHTML = `<svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg> 
            <span class="description">Editar</span>`;
        boton3.className = "action-button edit-button";
        boton3.type = "button";

        boton3.onclick = function () {
            document.getElementById('tipoCedulaUpdateUsuario').value = v.id_tipo_cedula;

            if (document.getElementById('cargoUpdateUsuario') !== null) {
                document.getElementById('tipoUpdateUsuario').value = v.id_tipo_usuario;
                document.getElementById('cargoUpdateUsuario').value = v.id_cargo;
                document.getElementById('tipoUpdateUsuario').classList.add("active");
                document.getElementById('cargoUpdateUsuario').classList.add("active");
            }

            document.getElementById('cedulaUpdateUsuario').value = v.cedula;
            document.getElementById('nombreUpdateUsuario').value = v.nombre;
            document.getElementById('apellidoUpdateUsuario').value = v.apellido;
            document.getElementById('usuarioUpdateUsuario').value = v.nombre_usuario;
            document.getElementById('correoUpdateUsuario').value = v.correo;

            document.getElementById('contrasenaUpdateUsuario').value = "";
            document.getElementById('contrasenaUpdateUsuario').classList.add("active");
            document.getElementById('tipoCedulaUpdateUsuario').classList.add("active");

            document.getElementById('cedulaUpdateUsuario').classList.add("active");
            document.getElementById('nombreUpdateUsuario').classList.add("active");
            document.getElementById('apellidoUpdateUsuario').classList.add("active");
            document.getElementById('usuarioUpdateUsuario').classList.add("active");
            document.getElementById('correoUpdateUsuario').classList.add("active");

            document.getElementById('idUpdateEmpleado').value = v.id_empleado;
            document.getElementById('idUpdateUsuario').value = v.id_usuario;

            modal('updateUsuarioModal');
        };

        celda6.appendChild(boton3);
        celda6.appendChild(boton2);
    }


tablaUsuario();

if (document.getElementById('addPatientButtonusuarios') !== null) {
    document.getElementById("addPatientButtonusuarios").addEventListener("click", function () {
        modal('registrarUsuarioModal');
    });
}

