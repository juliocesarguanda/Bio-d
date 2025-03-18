const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

function formatNumber(number) {
    return number.toString().includes('.') ? number.toString().replace(/\.?0+$/, '') : number;
}

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    try {
        let exchange_rate = 0;

        const queryParametros = "SELECT * FROM parametros";
        const resultadosParametros = await conexion(queryParametros, []);
        resultadosParametros.respuesta.forEach(row => {
            if (row.nombre === 'Bolivar') {
                exchange_rate = row.valor;
            }
        });

        const queryExamen = "SELECT * FROM examen WHERE estatus = 1";
        const resultadosExamen = await conexion(queryExamen, []);
        if (resultadosExamen.estatus === 'error') {
            reportError(__filename, new Date(), resultadosExamen.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los exámenes' });
        }

        const resultado = resultadosExamen.respuesta.map(mostrar => {
            mostrar.precio *= exchange_rate;
            return {
                id: mostrar.id,
                nombre: mostrar.nombre,
                descripcion: mostrar.descripcion,
                precio: formatNumber(mostrar.precio.toFixed(2))
            };
        });

        return res.status(200).json({ estatus: 'éxito', respuesta: resultado });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los exámenes: ' + error.message });
    }
});

module.exports = router;
