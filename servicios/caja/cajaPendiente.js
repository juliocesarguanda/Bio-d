const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

function format_number(number) {
    return number.includes('.') ? number.replace(/\.?0+$/, '') : number;
}

router.post('/', async (req, res) => { 
    if (!req.session.usuario) {
    return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
}
    try {
        const query = `
            SELECT p.id AS id_paciente, p.nombre AS nombre, tc.tipo AS tipo_cedula, tc.id AS tipo_cedula_id, 
                   p.apellido AS apellido, p.cedula AS cedula, e.nombre AS tipo_examen, 
                   pe.precio AS precio, cm.valor AS dolar, pe.fecha as fecha, pe.paciente_dia as paciente_dia, 
                   pe.abonado as abonado, pe.hora as hora, p.telefono as telefono
            FROM paciente_examen pe
            LEFT JOIN paciente p ON pe.paciente = p.id
            LEFT JOIN examen e ON pe.examen = e.id
            LEFT JOIN tipo_cedula tc ON p.tipo_cedula = tc.id
            LEFT JOIN parametros cm ON cm.nombre = 'Bolivar'
            WHERE pe.estatus != 0
            ORDER BY p.nombre ASC, p.cedula ASC
        `;
        const resultados = await conexion(query);

        if (resultados.estatus !== 'éxito') {
            return res.status(500).json({ estatus: 'error', respuesta: 'Error en la consulta de datos' });
        }

        const agrupados = {};
        resultados.respuesta.forEach(row => {
            
            const key = `${row.id_paciente}-${row.fecha}`;
            if (!agrupados[key]) {
                agrupados[key] = {
                    id_paciente: row.id_paciente,
                    tipo_cedula: row.tipo_cedula,
                    tipo_cedula_id: row.tipo_cedula_id,
                    cedula: row.cedula,
                    nombre: row.nombre,
                    apellido: row.apellido,
                    tipo_examen: [],
                    total_precio: 0,
                    total_abonado: 0,
                    dolar: row.dolar,
                    fecha: row.fecha,
                    hora: row.hora,
                    paciente_dia: row.paciente_dia,
                    telefono: row.telefono
                };
            }
            agrupados[key].tipo_examen.push(row.tipo_examen);
            agrupados[key].total_precio += row.precio;
            agrupados[key].total_abonado += row.abonado;
        });

        const resultado = [];
        Object.values(agrupados).forEach(value => {
            if (value.total_abonado < value.total_precio) {
                value.total_precio_bs = format_number((value.total_precio * value.dolar).toFixed(2));
                value.total_abonado_bs = format_number((value.total_abonado * value.dolar).toFixed(2));
                value.restante_bs = format_number(((value.total_precio - value.total_abonado) * value.dolar).toFixed(2));
                value.tipo_examen = value.tipo_examen.length > 1 ? value.tipo_examen.length : value.tipo_examen[0];
                resultado.push(value);
            }
        });

        return res.status(200).json(resultado);

    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
