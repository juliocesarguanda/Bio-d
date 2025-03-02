const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    try {
        const { usuario, empleado } = req.body;

        if (!usuario || !empleado) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        // Iniciar una transacción
        await conexion(`START TRANSACTION`);

        await conexion(`UPDATE usuario SET estatus = '0' WHERE id = ?`, [usuario]);
        await conexion(`UPDATE empleado SET estatus = '0' WHERE id = ?`, [empleado]);

        // Confirmar la transacción
        await conexion(`COMMIT`);
        return res.status(200).json({ estatus: 'exito', respuesta: 'Exito al eliminar el usuario' });
    } catch (error) {
        // En caso de error, revertir la transacción
        await conexion(`ROLLBACK`);
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
