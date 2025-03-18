const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion');
const { reportError } = require('../../utilidades/reporte');

// Ruta para obtener alertas de misceláneos
router.get('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    try {
        const query = 'SELECT cantidad, nombre FROM miscelaneo WHERE estatus = 1';
        const resultados = await conexion(query, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los misceláneos' });
        }

        const resultado = resultados.respuesta.map(mostrar => ({
            miscelaneoCantidad: mostrar.cantidad,
            miscelaneoNombre: mostrar.nombre
        }));

        return res.status(200).json(resultado);
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        return res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
