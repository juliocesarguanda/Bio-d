const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

// Ruta para eliminar un misceláneo
router.post('/', async (req, res) => {

    try {
        const id_empleado = req.session.usuario.id;
        const { nombre } = req.body;
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

        // Verificar si los datos requeridos están presentes
        if (!nombre) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const Id = nombre;

            const query = 'UPDATE miscelaneo SET estatus = 0 WHERE id = ?';
            const resultados = await conexion(query, [Id]);

            if (resultados.estatus === 'error') {
                reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, req.body);
                return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
            }

            scanAndSendRequests('/websocket/message', {
                message: {
                    codigo: '0007',
                    socketId: req.session.usuario.socketId,
                    id: nombre
                }
            });
            res.status(200).json({ estatus: 'éxito', respuesta: 'Éxito al eliminar el misceláneo' });
        } catch (error) {
            reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
            res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
        }

});

module.exports = router;

