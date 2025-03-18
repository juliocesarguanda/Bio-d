const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    try {
        const query = `
            SELECT id, nombre 
            FROM tipo_pago 
            WHERE estatus = 1
        `;
        const resultados = await conexion(query);

        if (resultados.estatus !== 'éxito') {
            return res.status(500).json({ estatus: 'error', respuesta: 'Error en la consulta de datos' });
        }

        const resultado = resultados.respuesta.map(row => ({
            id: row.id,
            nombre: row.nombre
        }));

        return res.status(200).json(resultado);

    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
