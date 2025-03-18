const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.get('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    try {
        const query = `
            SELECT e.*, r.nombre AS reactivo, r.estatus AS reactivoEstatus, r.id AS reactivoId, e.descripcion AS descripcion
            FROM analisis e
            LEFT JOIN reactivo r ON r.id = e.reactivo
            WHERE e.estatus = 1
        `;
        const resultados = await conexion(query, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los análisis' });
        }

        const resultado = resultados.respuesta.map(mostrar => ({
            id: mostrar.id,
            nombre: mostrar.nombre,
            valor: mostrar.valor,
            descripcion: mostrar.descripcion,
            reactivo: mostrar.reactivo,
            reactivoId: mostrar.reactivoId,
            reactivoEstatus: mostrar.reactivoEstatus
        }));

        return res.status(200).json({ estatus: 'éxito', respuesta: resultado });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los análisis: ' + error.message });
    }
});

module.exports = router;
