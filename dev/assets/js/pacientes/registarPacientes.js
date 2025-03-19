function DatosRegistrarPacientes() {
    sendRequest('pacientes/consultDatosRegistrarPacientes', {}, response => {
        if (response.estatus === 'éxito') {
            document.getElementById('tipoCedula').innerHTML = "";
            let t = { id: '', nombre: '' };
            insertConten(t, 'tipoCedula');
            response.respuesta.tipoCedula.forEach(item => insertConten(item, 'tipoCedula'));

            document.getElementById('convenios').innerHTML = "";
            insertConten(t, 'convenios');
            response.respuesta.convenios.forEach(item => insertConten(item, 'convenios'));

            document.getElementById('paciente').innerHTML = "";
            insertConten(t, 'paciente');
            response.respuesta.tipoPaciente.forEach(item => insertConten(item, 'paciente'));

            document.getElementById('registroSexo').innerHTML = "";
            insertConten(t, 'registroSexo');
            response.respuesta.sexo.forEach(item => insertConten(item, 'registroSexo'));
        } else {
            showNotification(response.respuesta, "info");
        }
    }, 'GET').catch(error => {
        showNotification( error.respuesta, "info");
    });
}



function consultRegistrarPacientesCedula() {
    const cedula = document.getElementById('cedula').value;
    const tipoCedula = document.getElementById('tipoCedula').value;

    sendRequest('pacientes/consultRegistrarPacientesCedula', { cedula, tipoCedula }, response => {
        if (response.estatus === 'éxito') {
            document.getElementById('nombre').value = response.respuesta.nombre;
            document.getElementById('apellido').value = response.respuesta.apellido;
            document.getElementById('telefono').value = response.respuesta.telefono;
            document.getElementById('fecha').value = response.respuesta.fecha;
            document.getElementById('convenios').value = response.respuesta.convenio;
            document.getElementById('paciente').value = response.respuesta.paciente;
            document.getElementById('registroSexo').value = response.respuesta.sexo;
            
            const fields = ['nombre', 'apellido', 'telefono', 'fecha', 'convenios', 'paciente', 'registroSexo'];
            fields.forEach(field => {
                document.getElementById(field).classList.add('active');
            });
        }
    });
}



document.getElementById("cedula")?.addEventListener("keyup", consultRegistrarPacientesCedula);
document.getElementById("tipoCedula")?.addEventListener("change", consultRegistrarPacientesCedula);

document.getElementById("PacienteExamenPendienteModalSi").addEventListener("click",function(){
    tablaPacienteExamen(document.getElementById('valorIdPacienteExamenPendiente').value);
    tablaPacienteExamenCombo(document.getElementById('valorIdPacienteExamenPendiente').value);
    modalClose('agregarExamenesModal');
    modal('formAnalisisModal');
    
		const botonAlert = document.querySelector(".container-svg-alert");
        botonAlert.style.display = "none";
        
		///////////////////////////////////////////////////////////

		const totalSpan = document.querySelector(".span-total");
		totalSpan.textContent= "0"

		////////////////////////////////////////////////
});

