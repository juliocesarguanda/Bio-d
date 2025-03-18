const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

// Ruta para actualizar el misceláneo con un nuevo lote
router.post('/', async (req, res) => {
    try {
        const { cantidadMiscelaneoIngresar, valorIngresarMiscelaneoId } = req.body;
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const id_empleado = req.session.usuario.id;

        // Verifica si los datos requeridos están presentes
        if (!cantidadMiscelaneoIngresar || !valorIngresarMiscelaneoId) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const cantidadMiscelaneo = Number(cantidadMiscelaneoIngresar);
        const Id = valorIngresarMiscelaneoId;

        // Obtener la cantidad actual del misceláneo
        const querySelect = 'SELECT cantidad FROM miscelaneo WHERE id = ?';
        const resultSelect = await conexion(querySelect, [Id]);

        if (resultSelect.estatus === 'error') {
            reportError(__filename, new Date(), resultSelect.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al obtener los datos del misceláneo' });
        }

        if (resultSelect.respuesta.length === 0) {
            return res.status(404).json({ estatus: 'error', respuesta: 'Misceláneo no encontrado' });
        }

        const cantidadActual = Number(resultSelect.respuesta[0].cantidad);

        const nuevaCantidadMiscelaneo = cantidadActual + cantidadMiscelaneo;

        // Actualizar la cantidad y el id_empleado
        const queryUpdate = 'UPDATE miscelaneo SET cantidad = ?, id_empleado = ? WHERE id = ?';
        const resultUpdate = await conexion(queryUpdate, [nuevaCantidadMiscelaneo, id_empleado, Id]);

        if (resultUpdate.estatus === 'error') {
            reportError(__filename, new Date(), resultUpdate.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al actualizar el misceláneo' });
        }

        scanAndSendRequests('/websocket/message', {
            message: {
                codigo: '0004',
                socketId: req.session.usuario.socketId,
                id: valorIngresarMiscelaneoId
            }
        });
        return res.status(200).json({ estatus: 'éxito', respuesta: 'Éxito al actualizar el misceláneo' });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }

});

module.exports = router;
