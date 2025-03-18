const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const sql = `
            SELECT pe.id, hp.fecha, e.nombre AS examen, eph.valor, eph.referencia, em.nombre, em.apellido
            FROM paciente_examen pe
            LEFT JOIN examen_paciente_historial eph ON pe.id = eph.examen
            LEFT JOIN historial_paciente hp ON eph.id_historial = hp.id
            LEFT JOIN examen e ON pe.examen = e.id
            LEFT JOIN empleado em ON hp.id_empleado = em.id
            WHERE pe.estatus = 2 AND pe.paciente = ?
            GROUP BY pe.id, hp.fecha, e.nombre, eph.valor, eph.referencia, em.nombre, em.apellido
        `;
        const result = await conexion(sql, [id]);

        if (result.estatus !== 'éxito') {
            throw new Error('Error al obtener el historial');
        }

        const resultado = result.respuesta.map(row => ({
            fecha: new Date(row.fecha).toLocaleDateString('es-VE'),
            examen: row.examen,
            resultado: row.valor,
            referencia: row.referencia,
            analista: `${row.nombre} ${row.apellido}`,
            id: row.id
        }));

        return res.status(200).json(resultado);
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
