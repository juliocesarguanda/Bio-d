const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

// Ruta para actualizar un reactivo
router.post('/', async (req, res) => {

    try {
        const id_empleado = req.session.usuario.id;
        const {
            nombre,
            marca,
            cantidad,
            requerido,
            valorEditarReactivoId
        } = req.body;

    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
        // Verificar si los datos requeridos están presentes
        if (!nombre || !marca || !cantidad || !requerido || !valorEditarReactivoId) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        // Convertir valores numéricos
        const cantidadReactivos = Number(cantidad);
        const requeridaReactivos = Number(requerido);
        const Id = valorEditarReactivoId;

        // Verificar si el reactivo con el nuevo nombre ya existe (excluyendo el actual)
        const queryVerificar = 'SELECT * FROM reactivo WHERE nombre = ? AND id != ? AND estatus = 1';
        const resultadosVerificar = await conexion(queryVerificar, [nombre, Id]);

        if (resultadosVerificar.estatus === 'error') {
            reportError(__filename, new Date(), resultadosVerificar.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al verificar el reactivo' });
        }

        if (resultadosVerificar.respuesta.length > 0) {
            return res.status(200).json({ estatus: 'info', respuesta: 'El reactivo ya existe, pruebe otro nombre' });
        }

        // Calcular la disponibilidad
        const disponibilidad = cantidadReactivos / requeridaReactivos;

        // Actualizar el reactivo
        const queryActualizar = `
            UPDATE reactivo 
            SET nombre = ?, marca = ?, cantidad = ?, cant = ?, disponible = ?, id_empleado = ? 
            WHERE id = ?
        `;
        const resultadosActualizar = await conexion(queryActualizar, [
            nombre,
            marca,
            requeridaReactivos,
            cantidadReactivos,
            disponibilidad,
            id_empleado,
            Id
        ]);

        if (resultadosActualizar.estatus === 'error') {
            reportError(__filename, new Date(), resultadosActualizar.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al actualizar el reactivo' });
        }

        scanAndSendRequests('/websocket/message', {
            message: {
                codigo: '0008',
                socketId: req.session.usuario.socketId,
                id: valorEditarReactivoId
            }
        });
        res.status(200).json({ estatus: 'éxito', respuesta: 'Éxito al actualizar el reactivo' });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
