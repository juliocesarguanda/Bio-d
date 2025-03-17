const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

// Ruta para actualizar el reactivo con un nuevo lote
router.post('/', async (req, res) => {

    try {
        const id_empleado = req.session.usuario.id;
        const { cantidadReactivoIngresar, valorIngresarReactivoId } = req.body;
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }

        // Verifica si los datos requeridos están presentes
        if (!cantidadReactivoIngresar || !valorIngresarReactivoId) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const cantidadReactivos = Number(cantidadReactivoIngresar);
        const Id = valorIngresarReactivoId;

        // Obtener 'cant' y 'cantidad' del reactivo
        const querySelect = 'SELECT cant, cantidad FROM reactivo WHERE id = ?';
        const resultadoSelect = await conexion(querySelect, [Id]);

        if (resultadoSelect.estatus === 'error') {
            reportError(__filename, new Date(), resultadoSelect.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al obtener los datos del reactivo' });
        }

        if (resultadoSelect.respuesta.length === 0) {
            return res.status(404).json({ estatus: 'error', respuesta: 'Reactivo no encontrado' });
        }

        const { cant, cantidad } = resultadoSelect.respuesta[0];
        const cantidadTotal = Number(cant) + cantidadReactivos;
        const disponibilidad = cantidadTotal / Number(cantidad);

        // Actualizar el reactivo
        const queryUpdate = 'UPDATE reactivo SET cant = ?, disponible = ?, id_empleado = ? WHERE id = ?';
        const resultadoUpdate = await conexion(queryUpdate, [cantidadTotal, disponibilidad, id_empleado, Id]);

        if (resultadoUpdate.estatus === 'error') {
            reportError(__filename, new Date(), resultadoUpdate.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al actualizar el reactivo' });
        }

        scanAndSendRequests('/websocket/message', {
            message: {
                codigo: '0005',
                socketId: req.session.usuario.socketId,
                id: valorIngresarReactivoId
            }
        });
        res.status(200).json({ estatus: 'éxito', respuesta: 'Éxito al actualizar el reactivo' });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
