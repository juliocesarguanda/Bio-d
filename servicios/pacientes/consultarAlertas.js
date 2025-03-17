const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const { id } = req.body;

        const query = `
            SELECT eph.alerta AS alerta, hp.fecha AS fecha, eph.examen AS id, eph.valor AS valor, 
                   eph.referencia AS referencia, a.nombre AS nombreExamen
            FROM examen_paciente_historial eph
            LEFT JOIN paciente_examen pe ON pe.id = eph.examen
            LEFT JOIN examen e ON e.id = pe.examen 
            LEFT JOIN historial_paciente hp ON eph.id_historial = hp.id 
            LEFT JOIN analisis a ON eph.analisis = a.id  
            WHERE eph.examen IN (SELECT id FROM paciente_examen WHERE paciente = ?) 
              AND eph.alerta != ' '
        `;
        const resultados = await conexion(query, [id]);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar las alertas' });
        }

        const resultado = resultados.respuesta.map(row => ({
            alerta: row.alerta,
            fecha: new Date(row.fecha).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            id: row.id,
            referencia: row.referencia,
            nombreExamen: row.nombreExamen,
            valor: row.valor
        }));

        res.status(200).json(resultado);
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar las alertas: ' + error.message });
    }
});

module.exports = router;
