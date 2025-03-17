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
        const { data } = req.body;
        const valor = data == true ? 1 : 0;

        const formattedDate = moment().format('YYYY-MM-DD');

        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }

        const id_empleado = req.session.usuario.id;

        const sqlUpdate = `UPDATE parametros SET valor = ?, tiempo = ?, id_empleado = ? WHERE nombre = 'feriado'`;
        const resultados = await conexion(sqlUpdate, [valor, formattedDate, id_empleado]);

        if (resultados.estatus === 'error') {
            reportError(__filename, moment().format('YYYY-MM-DD'), resultados.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: resultados.respuesta });
        }
        scanAndSendRequests('/websocket/message', {
            message: {
                codigo: '0011',
                socketId: req.session.usuario.socketId
            }
        });
        res.json({ estatus: 'éxito', respuesta: 'Feriado actualizado' });
    } catch (error) {
        reportError(__filename, moment().format('YYYY-MM-DD'), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Error al actualizar el feriado' });
    }
});

module.exports = router;
