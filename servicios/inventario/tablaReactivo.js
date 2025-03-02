const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion');
const { reportError } = require('../../utilidades/reporte');

// Ruta para obtener la tabla de reactivos
router.get('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    try {
        const query = 'SELECT * FROM reactivo WHERE estatus = 1';
        const resultados = await conexion(query, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al obtener los reactivos' });
        }

        const resultado = resultados.respuesta.map(mostrar => ({
            id: mostrar.id,
            nombre: mostrar.nombre,
            marca: mostrar.marca,
            disponible: mostrar.disponible,
            cant: mostrar.cant,
            cantidad: mostrar.cantidad
        }));

        res.json({ estatus: 'éxito', respuesta: resultado });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
