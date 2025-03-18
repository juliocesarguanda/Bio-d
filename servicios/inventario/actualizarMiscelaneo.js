const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

// Ruta para actualizar un misceláneo
router.post('/', async (req, res) => {
    try {
        const id_empleado = req.session.usuario.id;
        const { nombre, cantidad, valorEditarMiscelaneoId } = req.body;

    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

        // Verifica si los datos requeridos están presentes
        if (!nombre || !cantidad || !valorEditarMiscelaneoId) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        // Convertir valores numéricos
        const cantidadMiscelaneo = Number(cantidad);
        const IdMiscelaneo = valorEditarMiscelaneoId;

        // Verificar si el misceláneo con el nuevo nombre ya existe (excluyendo el actual)
        const queryVerificar = 'SELECT * FROM miscelaneo WHERE nombre = ? AND id != ? AND estatus = 1';
        const resultadosVerificar = await conexion(queryVerificar, [nombre, IdMiscelaneo]);

        if (resultadosVerificar.estatus === 'error') {
            reportError(__filename, new Date(), resultadosVerificar.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al verificar el misceláneo' });
        }

        if (resultadosVerificar.respuesta.length > 0) {
            return res.status(200).json({ estatus: 'info', respuesta: 'El misceláneo ya existe, pruebe otro nombre' });
        }

        // Actualizar el misceláneo
        const queryActualizar = `
            UPDATE miscelaneo 
            SET nombre = ?, cantidad = ?, id_empleado = ? 
            WHERE id = ?
        `;
        const resultadosActualizar = await conexion(queryActualizar, [
            nombre,
            cantidadMiscelaneo,
            id_empleado,
            IdMiscelaneo
        ]);

        if (resultadosActualizar.estatus === 'error') {
            reportError(__filename, new Date(), resultadosActualizar.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al actualizar el misceláneo' });
        }

        scanAndSendRequests('/websocket/message', {
            message: {
                codigo: '0009',
                socketId: req.session.usuario.socketId,
                id: valorEditarMiscelaneoId
            }
        });
        return res.status(200).json({ estatus: 'éxito', respuesta: 'Éxito al actualizar el misceláneo' });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
