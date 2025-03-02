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
        const { numerofactura, precioDolar } = req.body;
        const id_empleado = req.session.usuario.id;
        const datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Verificar si el número de factura ya está registrado
        const queryFactura = "SELECT * FROM factura WHERE numero = ?";
        const resultadosFactura = await conexion(queryFactura, [numerofactura]);

        if (resultadosFactura.respuesta.length > 0) {
            return res.status(200).json({ estatus: 'info', respuesta: 'El número de factura ya lo tiene una factura registrada' });
        }

        // Actualizar los parámetros
        try {
            const queryDolar = "UPDATE parametros SET valor = ?, tiempo = ?, id_empleado = ? WHERE nombre = 'Bolivar'";
            await conexion(queryDolar, [precioDolar, datetime, id_empleado]);

            const queryFacturaUpdate = "UPDATE parametros SET valor = ?, tiempo = ?, id_empleado = ? WHERE nombre = 'factura'";
            await conexion(queryFacturaUpdate, [numerofactura, datetime, id_empleado]);

            res.status(200).json({ estatus: 'exito', respuesta: 'Exito al actualizar los parametros' });
        } catch (error) {
            reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
            res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrio' });
        }
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Error al actualizar los parametros: ' + error.message });
    }
});

module.exports = router;
