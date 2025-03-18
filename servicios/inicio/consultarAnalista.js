const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

// Ruta para consultar el analista del día
router.post('/', async (req, res) => {

    try {
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const respuestaEnvio = {
            estatus: 'info',
            respuesta: 'Agrega el analista del día el cual es válido desde ahora hasta las 12:AM'
        };

        const query = 'SELECT valor FROM parametros WHERE nombre = "analista"';
        const resultados = await conexion(query, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los parámetros' });
        }

        resultados.respuesta.forEach(row => {
            respuestaEnvio.estatus = 'éxito';
            respuestaEnvio.respuesta = row.valor;
        });

        return res.status(200).json({ estatus: respuestaEnvio.estatus, respuesta: respuestaEnvio.respuesta });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        return res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
