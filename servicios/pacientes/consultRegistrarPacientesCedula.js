const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

// Añade índice en la tabla para optimizar búsquedas (Ejecutar en MySQL)
/*
ALTER TABLE paciente 
ADD INDEX idx_busqueda_rapida (tipo_cedula, cedula(50));
*/

router.post('/', async (req, res) => {
    try {
        // Validación rápida de autenticación
        if (!req.session.usuario) {
            return res.status(401).json({ 
                estatus: 'error', 
                respuesta: 'Acceso no autorizado' 
            });
        }

        const { cedula, tipoCedula } = req.body;
        
        // Validación estricta de parámetros
        if (!cedula || !tipoCedula || typeof cedula !== 'string' || cedula.length > 250) {
            return res.status(400).json({
                estatus: 'error',
                respuesta: 'Parámetros inválidos o faltantes'
            });
        }

        // Query optimizada con límite explícito
        const query = `
            SELECT 
                nombre, 
                apellido, 
                telefono, 
                DATE_FORMAT(fecha_nacimiento, '%Y-%m-%d') AS fecha,
                convenio, 
                tipo_paciente AS paciente, 
                sexo 
            FROM paciente 
            WHERE tipo_cedula = ? 
            AND cedula = ? 
            LIMIT 1`;  // Limitar a 1 resultado

        // Timeout configurado en la conexión
        const resultado = await conexion(query, [tipoCedula, cedula], 3000); // 3 segundos timeout

        if (resultado.estatus === 'error') {
            reportError(__filename, new Date(), resultado.respuesta, req.originalUrl, req.body);
            return res.status(500).json({
                estatus: 'error',
                respuesta: 'Error en la consulta'
            });
        }

        // Manejo explícito de "no encontrado"
        if (resultado.respuesta.length === 0) {
            return res.status(200).json({
                estatus: 'no encontrado',
                respuesta: 'No existe paciente con estos datos'
            });
        }

        // Respuesta exitosa
        return res.status(200).json({
            estatus: 'éxito',
            respuesta: resultado.respuesta[0]
        });

    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({
            estatus: 'error',
            respuesta: 'Error en el servidor'
        });
    }
});

module.exports = router;