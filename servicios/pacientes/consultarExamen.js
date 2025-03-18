const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

const moment = require('moment');

function formatNumber(number) {
    return number.toString().includes('.') ? number.replace(/\.?0+$/, '') : number;
}

router.post('/', async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const { id } = req.body;
        const currentHour = new Date().getHours();
        const currentDate = moment().format('YYYY-MM-DD'); // Obtiene la fecha actual en formato YYYY-MM-DD

        const query = `
            SELECT fe.valor AS feriado, fe.tiempo AS tiempo, bs.valor AS dolar, d.nombre AS nombre, 
                   d.precio AS precio, p.tipo_paciente AS tipo_paciente, d.id AS id, d.descripcion AS descripcion
            FROM examen d
            LEFT JOIN paciente p ON p.id = ?
            LEFT JOIN parametros bs ON bs.nombre = 'Bolivar'
            LEFT JOIN parametros fe ON fe.nombre = 'feriado'
            WHERE d.estatus != 0
        `;
        const resultados = await conexion(query, [id]);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los exámenes' });
        }

        const resultado = resultados.respuesta.map(mostrar => {
            const esFeriado = (mostrar.feriado == 1 && String(mostrar.tiempo).split('T')[0] === currentDate);
            const esDomingo = (new Date().getDay() === 0);
            let precioBruto = mostrar.precio * mostrar.dolar;
            let precio = precioBruto;
            let descuento = 0;

            // Aplicar recargos por feriado y horario nocturno
            if (esFeriado || esDomingo || (currentHour >= 19 || currentHour <= 3)) {
                precioBruto *= 1.30;
            }

            // Aplicar descuentos por tipo de paciente
            if (mostrar.tipo_paciente == 2) {
                descuento = 0.20 * precioBruto;
            } else if (mostrar.tipo_paciente == 3) {
                descuento = 0.30 * precioBruto;
            } else if (mostrar.tipo_paciente == 4) {
                descuento = precioBruto;
            }
            precio = precioBruto - descuento;

            return {
                id: mostrar.id,
                nombre: mostrar.nombre,
                descripcion: mostrar.descripcion,
                precio: formatNumber(precio.toFixed(2))
            };
        });

        return res.status(200).json(resultado);
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los exámenes: ' + error.message });
    }
});

module.exports = router;