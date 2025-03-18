const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

// Ruta para obtener la lista de misceláneos
router.get('/', async (req, res) => {

    try {
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const query = 'SELECT * FROM miscelaneo WHERE estatus = 1';
        const resultados = await conexion(query, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al obtener los misceláneos' });
        }

        const resultado = resultados.respuesta.map(mostrar => ({
            id: mostrar.id,
            nombre: mostrar.nombre,
            cantidad: mostrar.cantidad
        }));

        return res.status(200).json({ estatus: 'éxito', respuesta: resultado });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        return res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
