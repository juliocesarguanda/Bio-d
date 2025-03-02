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
        const query = "SELECT * FROM miscelaneo WHERE estatus = 1";
        const resultados = await conexion(query, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los datos de misceláneos' });
        }

        const resultado = resultados.respuesta.map(mostrar => ({
            nombre: mostrar.nombre,
            id: mostrar.id
        }));

        res.json({ estatus: 'éxito', respuesta: resultado });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los datos: ' + error.message });
    }
});

module.exports = router;
