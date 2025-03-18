const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

// Ruta para consultar empleados
router.post('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    try {
        let query = `
            SELECT nombre, apellido, id ,cargo
            FROM empleado
            WHERE estatus = 1
        `;


        const resultados = await conexion(query, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrió' });
        }

        const resultado = resultados.respuesta.map(mostrar => ({
            id: mostrar.id,
            nombre: mostrar.nombre,
            apellido: mostrar.apellido,
            cargo: mostrar.cargo
            
        }));

        return res.status(200).json({ estatus: 'éxito', respuesta: resultado });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        return res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
