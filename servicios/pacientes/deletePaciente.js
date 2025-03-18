const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

router.post('/', async (req, res) => {
    try {
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }

        const { valorIdPacienteDelete } = req.body;

        if (!valorIdPacienteDelete) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const sqlUpdate = 'UPDATE paciente SET estatus = 0 WHERE id = ?';
        const resultadosUpdate = await conexion(sqlUpdate, [valorIdPacienteDelete]);

        if (resultadosUpdate.estatus === 'error') {
            reportError(__filename, new Date(), resultadosUpdate.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al eliminar el paciente' });
        }

        scanAndSendRequests('/websocket/message', {
            message: {
                codigo: '0014',
                socketId: req.session.usuario.socketId,
                id: valorIdPacienteDelete
            }
        });
        return res.status(200).json({ estatus: 'exito', respuesta: 'Paciente eliminado correctamente' });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrio' });
    }
});

module.exports = router;
