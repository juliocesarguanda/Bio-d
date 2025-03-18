const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

// Ruta para registrar un reactivo
router.post('/', async (req, res) => {

    try {
        const id_empleado = req.session.usuario.id;
        const { nombre, marca, cantidad, requerido } = req.body;
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }

        // Verifica si los datos requeridos están presentes
        if (!nombre || !marca || !cantidad || !requerido) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const cantidadReactivo = Number(cantidad);
        const requeridoReactivo = Number(requerido);

        // Verificar si el reactivo ya existe
        const queryVerificar = 'SELECT * FROM reactivo WHERE nombre = ? AND estatus = 1';
        const resultadosVerificar = await conexion(queryVerificar, [nombre]);

        if (resultadosVerificar.estatus === 'error') {
            reportError(__filename, new Date(), resultadosVerificar.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al verificar el reactivo' });
        }

        if (resultadosVerificar.respuesta.length > 0) {
            return res.status(200).json({ estatus: 'info', respuesta: 'El reactivo ya existe, pruebe otro' });
        }

        try {
            const disponibilidad = cantidadReactivo / requeridoReactivo;

            const queryInsertar = 'INSERT INTO reactivo (nombre, marca, cantidad, cant, disponible, id_empleado) VALUES (?, ?, ?, ?, ?, ?)';
            const resultadosInsertar = await conexion(queryInsertar, [nombre, marca, requeridoReactivo, cantidadReactivo, disponibilidad, id_empleado]);

            if (resultadosInsertar.estatus === 'error') {
                reportError(__filename, new Date(), resultadosInsertar.respuesta, req.originalUrl, req.body);
                return res.status(500).json({ estatus: 'error', respuesta: 'Error al agregar el reactivo' });
            }
            scanAndSendRequests('/websocket/message', {
                message: {
                    codigo: '0003',
                    socketId: req.session.usuario.socketId
                }
            });
            return res.status(200).json({ estatus: 'éxito', respuesta: 'Éxito al agregar el reactivo' });
        } catch (error) {
            reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
        }
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
