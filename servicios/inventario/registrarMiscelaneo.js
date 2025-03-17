const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

// Ruta para registrar un nuevo misceláneo
router.post('/', async (req, res) => {
    try {
        const id_empleado = req.session.usuario.id;
        const { nombre, cantidad } = req.body;
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }

        // Verifica si los datos requeridos están presentes
        if (!nombre || !cantidad) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const nombreMiscelaneo = nombre;
        const cantidadMiscelaneo = Number(cantidad);

        // Verificar si el misceláneo ya existe
        const queryVerificar = 'SELECT * FROM miscelaneo WHERE nombre = ? AND estatus = 1';
        const resultadosVerificar = await conexion(queryVerificar, [nombreMiscelaneo]);

        if (resultadosVerificar.estatus === 'error') {
            reportError(__filename, new Date(), resultadosVerificar.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al verificar el misceláneo' });
        }

        if (resultadosVerificar.respuesta.length > 0) {
            return res.status(200).json({ estatus: 'info', respuesta: 'El misceláneo ya existe, pruebe otro nombre' });
        }

        // Registrar el nuevo misceláneo
        const queryInsertar = 'INSERT INTO miscelaneo (nombre, cantidad, id_empleado) VALUES (?, ?, ?)';
        const resultadosInsertar = await conexion(queryInsertar, [nombreMiscelaneo, cantidadMiscelaneo, id_empleado]);

        if (resultadosInsertar.estatus === 'error') {
            reportError(__filename, new Date(), resultadosInsertar.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al agregar el misceláneo' });
        }
        scanAndSendRequests('/websocket/message', {
            message: {
                codigo: '0002',
                socketId: req.session.usuario.socketId
            }
        });
        res.status(200).json({ estatus: 'éxito', respuesta: 'Éxito al agregar el misceláneo' });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
