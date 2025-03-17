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

        // Consulta los exámenes y su estado
        const query = `
            SELECT pe.id, e.nombre AS examen, pe.abonado, pe.precio ,e.descripcion
            FROM paciente_examen pe
            LEFT JOIN examen e ON pe.examen = e.id
            WHERE pe.estatus = 1 AND pe.paciente = ?
        `;

        const resultados = await conexion(query, [id]);

        if (resultados.estatus !== 'éxito') {
            return res.status(500).json({ estatus: 'error', respuesta: 'Error en la consulta de datos' });
        }

        const resultado = resultados.respuesta.map(mostrar => {
            const estado = mostrar.abonado >= mostrar.precio ? 1 : (mostrar.abonado !== 0 ? 2 : 0);
            return {
                nombre: mostrar.examen,
                descripcion: mostrar.descripcion,
                id: mostrar.id,
                estado: estado
            };
        });

        return res.status(200).json({ estatus: 'éxito', respuesta: resultado });

    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
