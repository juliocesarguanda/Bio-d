const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

function formatNumber(number) {
    return number.toString().includes('.') ? number.toString().replace(/\.?0+$/, '') : number;
}

router.post('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
       return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
   }
    try {
        const query = `
            SELECT fe.valor AS feriado, fe.tiempo AS tiempo, bs.valor AS dolar, d.nombre AS nombre, d.precio AS precio, d.id AS id, d.descripcion AS descripcion
            FROM examen d
            LEFT JOIN parametros bs ON bs.nombre = 'Bolivar'
            LEFT JOIN parametros fe ON fe.nombre = 'feriado'
            WHERE d.estatus != 0
        `;
        const resultados = await conexion(query, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los datos de exámenes' });
        }

        const resultado = resultados.respuesta.map(mostrar => {
            let precio = mostrar.precio * mostrar.dolar;
            return {
                id: mostrar.id,
                nombre: mostrar.nombre,
                descripcion: mostrar.descripcion,
                precio: formatNumber(precio.toFixed(2))
            };
        });

        return res.status(200).json({ estatus: 'éxito', respuesta: resultado });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los datos: ' + error.message });
    }
});

module.exports = router;
