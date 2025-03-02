const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

function calcularEdad(fechaNacimiento) {
    const fechaNacimientoObj = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimientoObj.getFullYear();
    const mes = hoy.getMonth() - fechaNacimientoObj.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimientoObj.getDate())) {
        edad--;
    }
    return edad;
}

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    const { id } = req.body;
    
    try {
        let convenios = [];
        const servicios = [];

        // Consultar servicios
        const queryServicios = 'SELECT id, nombre FROM servicio WHERE estatus = 1';
        const resultadosServicios = await conexion(queryServicios);

        if (resultadosServicios.estatus !== 'éxito') {
            return res.status(500).json({ estatus: 'error', respuesta: 'Error en la consulta de servicios' });
        }

        resultadosServicios.respuesta.forEach(mostrar => {
            servicios.push({ id: mostrar.id, nombre: mostrar.nombre });
        });

        // Consultar datos del analista
        const queryAnalista = `
            SELECT c.nombre AS cargos, e.nombre AS nombre, e.apellido AS apellido
            FROM empleado e
            LEFT JOIN cargo c ON e.cargo = c.id 
            LEFT JOIN parametros a ON a.nombre = 'analista'
            WHERE e.id_usuario = a.valor
        `;
        const resultadosAnalista = await conexion(queryAnalista);

        if (resultadosAnalista.estatus !== 'éxito') {
            return res.status(500).json({ estatus: 'error', respuesta: 'Error en la consulta de analista' });
        }

        const analista = resultadosAnalista.respuesta[0] || {};

        // Consultar datos del paciente y sus exámenes y análisis
        const queryPaciente = `
            SELECT paciente_examen.id AS idExanePaciente, paciente_examen.paciente_dia AS numero, 
                   paciente.fecha_nacimiento AS fecha_nacimiento, paciente.nombre AS nombrePaciente, 
                   paciente.apellido AS apellidoPaciente, tipo_cedula.tipo AS tipo_cedula, 
                   paciente.cedula AS cedulaPaciente, examen.id AS examenId, 
                   examen.nombre AS nombreExamen, convenio.nombre AS convenio, sexo.valor AS sexo, 
                   convenio.id AS remitida, analisis.id AS analisisId, analisis.nombre AS nombreAnalisis, 
                   analisis.valor AS valorReferencia
            FROM paciente_examen 
            INNER JOIN paciente ON paciente_examen.paciente = paciente.id 
            INNER JOIN convenio ON paciente.convenio = convenio.id 
            INNER JOIN sexo ON paciente.sexo = sexo.id 
            INNER JOIN tipo_cedula ON paciente.tipo_cedula = tipo_cedula.id 
            INNER JOIN examen ON paciente_examen.examen = examen.id 
            INNER JOIN examen_analisis ON examen_analisis.id_examen = examen.id 
            INNER JOIN analisis ON examen_analisis.id_analisis = analisis.id 
            WHERE paciente.id = ? AND paciente_examen.estatus = 1
        `;
        const resultadosPaciente = await conexion(queryPaciente, [id]);

        if (resultadosPaciente.estatus !== 'éxito') {
            return res.status(500).json({ estatus: 'error', respuesta: 'Error en la consulta de datos del paciente' });
        }

        let paciente = {};
        let examenes = {};

        resultadosPaciente.respuesta.forEach(mostrar => {
            if (!paciente.spanNombre) {
                paciente = {
                    spanNumero: String(mostrar.numero).padStart(2, '0'),
                    spanEdad: calcularEdad(mostrar.fecha_nacimiento),
                    spanFecha: new Date(),
                    spanNombre: `${mostrar.nombrePaciente} ${mostrar.apellidoPaciente}`,
                    spanCedula: `${mostrar.tipo_cedula}${mostrar.cedulaPaciente}`,
                    idPaciente: id,
                    convenio: mostrar.convenio,
                    remitida: mostrar.remitida,
                    sexo: mostrar.sexo
                };
                convenios.push({ nombre: mostrar.convenio, id: mostrar.remitida });
            }

            if (!examenes[mostrar.examenId]) {
                examenes[mostrar.examenId] = {
                    examenId: mostrar.examenId,
                    nombreExamen: mostrar.nombreExamen,
                    idExanePaciente: mostrar.idExanePaciente,
                    analisis: []
                };
            }

            const analisisExistente = examenes[mostrar.examenId].analisis.find(a => a.analisisId === mostrar.analisisId);
            if (!analisisExistente) {
                examenes[mostrar.examenId].analisis.push({
                    analisisId: mostrar.analisisId,
                    nombreAnalisis: mostrar.nombreAnalisis,
                    valorReferencia: mostrar.valorReferencia
                });
            }
        });

        return res.status(200).json({ estatus: 'éxito', respuesta: {
            analista: {
                nombre: analista.nombre || '',
                apellido: analista.apellido || '',
                cargos: analista.cargos || ''
            },
            servicios: servicios,
            paciente: paciente,
            convenios: convenios,
            examenes: Object.values(examenes)
        }});

    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;

