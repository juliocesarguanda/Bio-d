const express = require('express');
const router = express.Router();
const moment = require('moment');
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

router.post('/', async (req, res) => {

    try {
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }

        const { nombre } = req.body;
        const id_empleado = req.session.usuario.id;

        if (!nombre) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const fecha = moment().format('YYYY-MM-DD'); // Formatear la fecha
        const query = 'UPDATE parametros SET tiempo = ?, id_empleado = ?, valor = ? WHERE nombre = "analista"';
        const resultados = await conexion(query, [fecha, id_empleado, nombre]);

        if (resultados.estatus === 'error') {
            reportError(__filename, moment().format('YYYY-MM-DD'), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrió' });
        }

        scanAndSendRequests('/websocket/message', {
            message: {
                codigo: '0010',
                socketId: req.session.usuario.socketId
            }
        });
        res.status(200).json({ estatus: 'éxito', respuesta: 'Analista actualizado correctamente' });
    } catch (error) {
        reportError(__filename, moment().format('YYYY-MM-DD'), error.message, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
