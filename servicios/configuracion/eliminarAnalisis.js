const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const id_empleado = req.session.usuario.id;

        // Actualizar el estado del análisis a 0 (eliminado)
        try {
            const sqlUpdate = "UPDATE analisis SET estatus = 0 WHERE id = ?";
            await conexion(sqlUpdate, [nombre]);

            return res.status(200).json({ estatus: 'exito', respuesta: 'Exito al eliminar el análisis' });
        } catch (error) {
            reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrio' });
        }
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Error al eliminar el análisis: ' + error.message });
    }
});

module.exports = router;
