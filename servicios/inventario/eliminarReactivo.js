const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

// Ruta para eliminar un reactivo
router.post('/', async (req, res) => {

    try {
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const { nombre } = req.body;

        // Verificar si los datos requeridos están presentes
        if (!nombre) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const Id = nombre;

        const sql = 'UPDATE reactivo SET estatus = 0 WHERE id = ?';
        const resultados = await conexion(sql, [Id]);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrió' });
        }

        scanAndSendRequests('/websocket/message', {
            message: {
                codigo: '0006',
                socketId: req.session.usuario.socketId,
                id: nombre
            }
        });
        res.status(200).json({ estatus: 'éxito', respuesta: 'Éxito al eliminar el reactivo' });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrió' });
    }
});

module.exports = router;
