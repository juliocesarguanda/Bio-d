const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const moment = require('moment');

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    const { registrarFactura, paciente } = req.body;

    if (!registrarFactura || !paciente) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
    }

    try {
        // Obtener los parámetros
        const parametrosResult = await conexion("SELECT * FROM parametros");

        if (parametrosResult.estatus !== 'éxito') {
            throw new Error('Error en la consulta de parámetros');
        }

        let numero = null;
        parametrosResult.respuesta.forEach(row => {
            if (row.nombre === 'factura') {
                numero = row.valor;
            }
        });

        // Actualizar la factura
        const updateFacturaResult = await conexion(`
            UPDATE factura SET numero = ?, numeo_paciente_dia = ? WHERE id = ?
        `, [numero, paciente, registrarFactura]);

        if (updateFacturaResult.estatus !== 'éxito') {
            throw new Error('Error actualizando la factura');
        }

        // Incrementar el valor del número de factura
        numero++;
        const fecha =  moment().format('YYYY-MM-DD');
        const updateParametrosResult = await conexion(`
            UPDATE parametros SET valor = ?, tiempo = ? WHERE nombre = 'factura'
        `, [numero, fecha]);

        if (updateParametrosResult.estatus !== 'éxito') {
            throw new Error('Error actualizando los parámetros');
        }

        // Respuesta exitosa
        res.json({ estatus: 'exito' });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
