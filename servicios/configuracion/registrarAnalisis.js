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
        const {
            nombre, valor, reactivo, description, checkboxSeleccionados
        } = req.body;

        if (!nombre || !valor || !reactivo || !description || !checkboxSeleccionados) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const id_empleado = req.session.usuario.id;

        // Verificar si el análisis ya existe
        const sqlSelect = "SELECT * FROM analisis WHERE nombre = ? AND descripcion = ? AND estatus = 1";
        const resultadosSelect = await conexion(sqlSelect, [nombre, description]);

        if (resultadosSelect.respuesta.length > 0) {
            return res.status(200).json({ estatus: 'info', respuesta: 'El análisis ya existe, pruebe otro' });
        }

        try {
            // Insertar nuevo análisis
            const sqlInsert = "INSERT INTO analisis (nombre, valor, reactivo, id_empleado, descripcion) VALUES (?, ?, ?, ?, ?)";
            const resultadosInsert = await conexion(sqlInsert, [nombre, valor, reactivo, id_empleado, description]);
            const idanalisis = resultadosInsert.respuesta.insertId;

            // Insertar misceláneos asociados al análisis
            const sqlMiscelaneo = "INSERT INTO miscelaneo_analisis (miscelaneo, analisis) VALUES (?, ?)";
            for (let miscelaneo of checkboxSeleccionados) {
                await conexion(sqlMiscelaneo, [miscelaneo, idanalisis]);
            }

            return res.status(200).json({ estatus: 'exito', respuesta: 'Análisis insertado correctamente' });
        } catch (error) {
            reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrio' });
        }
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Error al registrar el análisis: ' + error.message });
    }
});

module.exports = router;
