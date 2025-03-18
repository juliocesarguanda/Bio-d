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
        const { id } = req.body;

        const query = `
            SELECT e.nombre AS analisisNombre, e.id AS analisisId, e.descripcion AS descripcion
            FROM examen_analisis ec 
            LEFT JOIN analisis e ON e.id = ec.id_analisis
            WHERE ec.id_examen = ?
        `;
        const resultados = await conexion(query, [id]);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los datos de exámenes existentes' });
        }

        const resultado = resultados.respuesta.map(mostrar => ({
            id: mostrar.analisisId,
            nombre: mostrar.analisisNombre,
            descripcion: mostrar.descripcion
        }));

        return res.status(200).json({ estatus: 'éxito', respuesta: resultado });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los datos: ' + error.message });
    }
});

module.exports = router;
