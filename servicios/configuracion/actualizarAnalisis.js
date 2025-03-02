const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    try {
        const {
            nombre, valor, reactivo, description, valorEditarAnalisisId, checkEditM
        } = req.body;

        if (!nombre || !valor || !reactivo || !description || !valorEditarAnalisisId || !checkEditM) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const id_empleado = req.session.usuario.id;

        // Verificar si el análisis ya existe
        const sqlSelect = "SELECT * FROM analisis WHERE nombre = ? AND descripcion = ? AND id != ? AND estatus = 1";
        const resultadosSelect = await conexion(sqlSelect, [nombre, description, valorEditarAnalisisId]);

        if (resultadosSelect.respuesta.length > 0) {
            return res.status(200).json({ estatus: 'info', respuesta: 'El Análisis ya existe, pruebe otro nombre' });
        }

        try {
            // Actualizar análisis
            const sqlUpdate = `
                UPDATE analisis 
                SET nombre = ?, valor = ?, descripcion = ?, reactivo = ?, id_empleado = ?  
                WHERE id = ?
            `;
            await conexion(sqlUpdate, [nombre, valor, description, reactivo, id_empleado, valorEditarAnalisisId]);

            // Eliminar misceláneos asociados al análisis
            const sqlDeleteMiscelaneo = "DELETE FROM miscelaneo_analisis WHERE Analisis = ?";
            await conexion(sqlDeleteMiscelaneo, [valorEditarAnalisisId]);

            // Insertar misceláneos asociados al análisis
            const sqlInsertMiscelaneo = "INSERT INTO miscelaneo_analisis (miscelaneo, Analisis) VALUES (?, ?)";
            for (let miscelaneo of checkEditM) {
                await conexion(sqlInsertMiscelaneo, [miscelaneo, valorEditarAnalisisId]);
            }

            res.status(200).json({ estatus: 'exito', respuesta: 'Análisis actualizado correctamente' });
        } catch (error) {
            reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
            res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrio' });
        }
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Error al actualizar el análisis: ' + error.message });
    }
});

module.exports = router;
