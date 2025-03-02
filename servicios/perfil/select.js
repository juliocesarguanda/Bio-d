const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.get('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    try {
        const respuesta = { cargo: [], tipoUsuario: [], tipoCedula: [] };

        const queryCargo = 'SELECT id, nombre FROM cargo';
        const resultadosCargo = await conexion(queryCargo, []);

        if (resultadosCargo.estatus === 'error') {
            reportError(__filename, new Date(), resultadosCargo.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: resultadosCargo.respuesta });
        }
        respuesta.cargo = resultadosCargo.respuesta;

        const queryTipoUsuario = 'SELECT id, nombre FROM tipo_usuario';
        const resultadosTipoUsuario = await conexion(queryTipoUsuario, []);

        if (resultadosTipoUsuario.estatus === 'error') {
            reportError(__filename, new Date(), resultadosTipoUsuario.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: resultadosTipoUsuario.respuesta });
        }
        respuesta.tipoUsuario = resultadosTipoUsuario.respuesta;

        const queryTipoCedula = 'SELECT id, tipo AS nombre FROM tipo_cedula';
        const resultadosTipoCedula = await conexion(queryTipoCedula, []);

        if (resultadosTipoCedula.estatus === 'error') {
            reportError(__filename, new Date(), resultadosTipoCedula.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: resultadosTipoCedula.respuesta });
        }
        respuesta.tipoCedula = resultadosTipoCedula.respuesta;

        res.json({ estatus: 'éxito', respuesta });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los datos: ' + error.message });
    }
});

module.exports = router;
