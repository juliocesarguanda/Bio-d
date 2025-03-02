const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

const moment = require('moment');

function format_number(number) {
    return number.includes('.') ? number.replace(/\.?0+$/, '') : number;
}

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    try {
        const fechaActual = moment().format('YYYY-MM-DD');

        const query = `
            SELECT *, p.valor AS Bolivar, f.numero AS numero, c.cantidad AS total, f.total AS ftotal
            FROM factura f
            LEFT JOIN parametros p ON p.nombre = 'Bolivar'
            LEFT JOIN caja c ON f.caja = c.id
            LEFT JOIN tipo_pago tp ON c.tipo_pago = tp.id
            WHERE f.numero != '0' AND f.fecha = ?
        `;
        const resultados = await conexion(query, [fechaActual]);

        if (resultados.estatus !== 'éxito') {
            throw new Error('Error en la consulta de datos');
        }
        const cierreCaja = {
            facturadoTotal: 0,
            facturadoCantidad: 0,
            noFacturadoTotal: 0,
            noFacturadoCantidad: 0
        };
console.table(resultados.respuesta)
        resultados.respuesta.forEach(row => {
            if (row.numero !== 'none') {
                cierreCaja.facturadoTotal += parseFloat(format_number((row.total * row.Bolivar).toFixed(2)));
                cierreCaja.facturadoCantidad++;
            }
            if (row.numero !== '0') {
                cierreCaja.noFacturadoTotal += parseFloat(format_number((row.total * row.Bolivar).toFixed(2)));
                cierreCaja.noFacturadoCantidad++;
            }
        });

        const resultado = {
            facturadoTotal: format_number(cierreCaja.facturadoTotal.toFixed(2)),
            facturadoCantidad: format_number(cierreCaja.facturadoCantidad.toFixed(2)),
            noFacturadoTotal: format_number(cierreCaja.noFacturadoTotal.toFixed(2)),
            noFacturadoCantidad: format_number(cierreCaja.noFacturadoCantidad.toFixed(2))
        };

        res.json({ estatus: 'éxito', respuesta: resultado });

    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
// .toLocaleDateString('es-VE')