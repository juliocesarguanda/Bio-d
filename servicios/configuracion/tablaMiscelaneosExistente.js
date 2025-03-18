const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
       return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
   }
    try {
        const { id } = req.body;

        const query = `
            SELECT me.analisis AS analisis, m.nombre AS miscelaneoNombre, m.id AS miscelaneoId FROM miscelaneo_analisis me LEFT JOIN miscelaneo m ON m.id = me.miscelaneo WHERE me.analisis = ?
        `;
        const resultados = await conexion(query, [id]);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los datos de misceláneos existentes' });
        }

        const resultado = resultados.respuesta.map(mostrar => ({
            id: mostrar.miscelaneoId,
            nombre: mostrar.miscelaneoNombre,
        }));

        return res.status(200).json({ estatus: 'éxito', respuesta: resultado });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los datos: ' + error.message });
    }
});

module.exports = router;
