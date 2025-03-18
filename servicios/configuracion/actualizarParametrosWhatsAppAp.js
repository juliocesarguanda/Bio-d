const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

const moment = require('moment');
router.post('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    try {
        const { instanceId, token } = req.body;

        const id_empleado = req.session.usuario.id;
        const datetime = moment().format('YYYY-MM-DD');

        // Actualizar los valores de 'instance_id' y 'token'
        try {
            const queryInstanceId = "UPDATE parametros SET valor = ?, tiempo = ?, id_empleado = ? WHERE nombre = 'instance_id'";
            await conexion(queryInstanceId, [instanceId || '', datetime, id_empleado]);

            const queryToken = "UPDATE parametros SET valor = ?, tiempo = ?, id_empleado = ? WHERE nombre = 'token'";
            await conexion(queryToken, [token || '', datetime, id_empleado]);

            return res.status(200).json({ estatus: 'exito', respuesta: 'Exito al actualizar WhatsAppAp' });
        } catch (error) {
            reportError(__filename, moment().format('YYYY-MM-DD'), error.message, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrio' });
        }
    } catch (error) {
        reportError(__filename, moment().format('YYYY-MM-DD'), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Error al actualizar WhatsAppAp: ' + error.message });
    }
});

module.exports = router;
