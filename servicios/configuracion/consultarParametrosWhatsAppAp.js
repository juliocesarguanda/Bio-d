const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.get('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    try {
        const queryParametros = 'SELECT nombre, valor FROM parametros';
        const resultados = await conexion(queryParametros, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los parámetros' });
        }

        let token = 0;
        let instanceId = 0;

        resultados.respuesta.forEach(row => {
            if (row.nombre === 'instance_id') {
                instanceId = row.valor;
            } else if (row.nombre === 'token') {
                token = row.valor;
            }
        });

        return res.status(200).json({ estatus: 'éxito', respuesta: { token, instanceId } });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los parámetros: ' + error.message });
    }
});

module.exports = router;

