const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.get('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    try {
        const fechaActual = new Date();
        const formattedDate = fechaActual.toISOString().split('T')[0]; // Obtener solo la fecha en formato YYYY-MM-DD
        const queryParametros = 'SELECT nombre, valor, tiempo FROM parametros WHERE nombre = "feriado"';
        const resultados = await conexion(queryParametros, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los feriados' });
        }

        let esFeriado = false;

        resultados.respuesta.forEach(row => {
            const fechaFeriado = new Date(row.tiempo);
            const fechaFeriadoLocal = new Date(fechaFeriado.getTime() - (fechaFeriado.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            if (row.valor == 1 && fechaFeriadoLocal === formattedDate) {
                esFeriado = true;
            }
        });

        res.json({ estatus: 'éxito', respuesta: esFeriado });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los feriados: ' + error.message });
    }
});

module.exports = router;
