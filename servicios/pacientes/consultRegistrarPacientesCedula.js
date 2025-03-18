const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    try {
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }

        const { cedula, tipoCedula } = req.body;
        const query = `
            SELECT nombre, apellido, telefono, DATE_FORMAT(fecha_nacimiento, '%Y-%m-%d') AS fecha, 
                   convenio, tipo_paciente AS paciente, sexo 
            FROM paciente 
            WHERE cedula = ? AND tipo_cedula = ?
        `;
        if (cedula && tipoCedula) {

            const resultados = await conexion(query, [cedula, tipoCedula]);

            if (resultados.estatus === 'error') {
                reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, req.body);
                return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los datos del paciente' });
            }

            if (resultados.respuesta.length > 0) {
                const paciente = resultados.respuesta[0];
                return res.status(200).json({ estatus: 'éxito', respuesta: paciente });
            }
        }
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los datos: ' + error.message });
    }
});

module.exports = router;
