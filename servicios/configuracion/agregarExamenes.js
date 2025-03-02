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
        const { nombre, valor, descripcion, checkboxSeleccionados } = req.body;

        if (!nombre || !valor || !descripcion || !checkboxSeleccionados) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        // Obtener el valor del parámetro 'Bolivar'
        const queryBolivar = "SELECT valor FROM parametros WHERE nombre = 'Bolivar'";
        const resultadosBolivar = await conexion(queryBolivar, []);
        const valorBolivar = resultadosBolivar.respuesta[0].valor;
        const precioExamen = valor / valorBolivar;

        // Verificar si el examen ya existe
        const queryExistente = "SELECT * FROM examen WHERE nombre = ? AND descripcion = ? AND estatus = 1";
        const resultadosExistente = await conexion(queryExistente, [nombre, descripcion]);

        if (resultadosExistente.respuesta.length > 0) {
            return res.status(200).json({ estatus: 'info', respuesta: 'El examen ya existe, pruebe otro' });
        }

        try {
            // Insertar nuevo examen
            const queryInsertar = "INSERT INTO examen (nombre, precio, descripcion) VALUES (?, ?, ?)";
            const resultadosInsertar = await conexion(queryInsertar, [nombre, precioExamen, descripcion]);
            const idExamen = resultadosInsertar.respuesta.insertId;

            // Insertar análisis asociados al examen
            const queryInsertarAnalisis = "INSERT INTO examen_analisis (id_examen, id_analisis) VALUES (?, ?)";
            for (let analisis of checkboxSeleccionados) {
                await conexion(queryInsertarAnalisis, [idExamen, analisis]);
            }

            res.status(201).json({ estatus: 'exito', respuesta: 'Examen agregado correctamente' });
        } catch (error) {
            reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
            res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrio' });
        }
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Error al agregar el examen: ' + error.message });
    }
});

module.exports = router;
