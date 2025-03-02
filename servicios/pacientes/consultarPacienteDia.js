const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

const moment = require('moment');

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
    const fechaActual =  moment().format('YYYY-MM-DD');

    try {
        const query = `
            SELECT pe.id AS paciente_examen_id, pe.paciente, pe.fecha AS fecha, pe.paciente_dia AS paciente_dia, 
                   eph.id AS examen_paciente_historial_id, eph.valor AS valor, eph.referencia AS referencia, 
                   hp.nota, p.cedula, p.nombre AS paciente_nombre, p.apellido, p.fecha_nacimiento AS fecha_nacimiento, 
                   sx.valor AS sexo_valor, tc.tipo AS tipo_cedula_tipo, e.nombre AS examen_nombre, s.nombre AS servicio_nombre, 
                   c.nombre AS convenio_nombre, ca.nombre AS cargo, em.nombre AS analista_nombre, em.apellido AS analista_apellido, 
                   f.numero AS numero, pe.precio AS precio
            FROM paciente_examen pe 
            JOIN examen_paciente_historial eph ON pe.id = eph.examen 
            JOIN historial_paciente hp ON eph.id_historial = hp.id 
            JOIN paciente p ON pe.paciente = p.id 
            JOIN examen e ON pe.examen = e.id 
            LEFT JOIN examen_factura ef ON pe.id = ef.examen 
            LEFT JOIN factura f ON ef.factura = f.id 
            JOIN servicio s ON hp.servicio = s.id 
            JOIN convenio c ON hp.remitida = c.id 
            JOIN sexo sx ON p.sexo = sx.id 
            JOIN tipo_cedula tc ON p.tipo_cedula = tc.id 
            JOIN empleado em ON hp.id_empleado = em.id 
            JOIN cargo ca ON em.cargo = ca.id 
            WHERE hp.fecha = ? 
            ORDER BY pe.paciente_dia ASC
        `;
        const resultados = await conexion(query, [fechaActual]);

        if (resultados.estatus !== 'éxito') {
            return res.status(500).json({ estatus: 'error', respuesta: 'Error en la consulta de datos' });
        }

        const pacientes = {};

        resultados.respuesta.forEach(dato => {
            const cedula = dato.tipo_cedula_tipo + dato.cedula;
            const pacienteDia = dato.paciente_dia;

            if (!pacientes[pacienteDia]) {
                pacientes[pacienteDia] = {};
            }

            if (!pacientes[pacienteDia][cedula]) {
                pacientes[pacienteDia][cedula] = {
                    fecha: dato.fecha,
                    paciente_dia: dato.paciente_dia,
                    paciente_examen_id: dato.paciente_examen_id,
                    cedula: cedula,
                    paciente_nombre: `${dato.paciente_nombre} ${dato.apellido}`,
                    sexo_valor: dato.sexo_valor,
                    examen_nombre: dato.examen_nombre,
                    valor: dato.valor,
                    referencia: dato.referencia,
                    servicio_nombre: dato.servicio_nombre,
                    convenio_nombre: dato.convenio_nombre,
                    cargo: `${dato.cargo} ${dato.analista_nombre} ${dato.analista_apellido}`,
                    examen_count: 1
                };
            } else {
                pacientes[pacienteDia][cedula].examen_count++;
                pacientes[pacienteDia][cedula].examen_nombre = pacientes[pacienteDia][cedula].examen_count;
            }
        });

        const resultado = Object.values(pacientes).flatMap(pacientesDia =>
            Object.values(pacientesDia)
        );

        return res.status(200).json({ estatus: 'éxito', respuesta:resultado});

    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
