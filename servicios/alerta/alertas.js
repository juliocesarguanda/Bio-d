const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

// Ruta para obtener alertas de reactivos
router.get('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    try {
        const query = `
            SELECT e.nombre AS nombreAnalisis, r.nombre AS nombreReactivo, r.estatus AS reactivoEstatus,
                   r.id AS reactivoId, r.disponible AS disponible
            FROM analisis e
            LEFT JOIN reactivo r ON r.id = e.reactivo
            WHERE e.estatus = 1
        `;
        const resultados = await conexion(query, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los reactivos' });
        }

        const resultado = resultados.respuesta.map(mostrar => ({
            analisis: mostrar.nombreAnalisis,
            nombreReactivo: mostrar.nombreReactivo,
            disponible: mostrar.disponible,
            estatusReactivo: mostrar.reactivoEstatus
        }));

        res.json(resultado);
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
