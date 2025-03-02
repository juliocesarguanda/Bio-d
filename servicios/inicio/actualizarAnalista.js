const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

const moment = require('moment');
// Ruta para actualizar el analista de turno
router.post('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    const { nombre } = req.body;
    const id_empleado = req.session.usuario.id;

    if (!nombre) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
    }

    const fecha = moment().format('YYYY-MM-DD'); // Formatear la fecha

    try {
        const query = 'UPDATE parametros SET tiempo = ?, id_empleado = ?, valor = ? WHERE nombre = "analista"';
        const resultados = await conexion(query, [fecha, id_empleado, nombre]);

        if (resultados.estatus === 'error') {
            reportError(__filename, moment().format('YYYY-MM-DD'), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrió' });
        }

        res.status(200).json({ estatus: 'éxito', respuesta: 'Analista actualizado correctamente' });
    } catch (error) {
        reportError(__filename, moment().format('YYYY-MM-DD'), error.message, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
