const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.get('/', async (req, res) => {
    try {
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const resultado = { convenios: [], tipoCedula: [], tipoPaciente: [], sexo: [] };

        // Consultar convenios
        const queryConvenio = 'SELECT id, nombre FROM convenio WHERE estatus = 1';
        const resultadosConvenio = await conexion(queryConvenio, []);
        if (resultadosConvenio.estatus === 'error') {
            reportError(__filename, new Date(), resultadosConvenio.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: resultadosConvenio.respuesta });
        }
        resultado.convenios = resultadosConvenio.respuesta;

        // Consultar tipo de cédula
        const queryTipoCedula = 'SELECT id, tipo AS nombre FROM tipo_cedula';
        const resultadosTipoCedula = await conexion(queryTipoCedula, []);
        if (resultadosTipoCedula.estatus === 'error') {
            reportError(__filename, new Date(), resultadosTipoCedula.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: resultadosTipoCedula.respuesta });
        }
        resultado.tipoCedula = resultadosTipoCedula.respuesta;

        // Consultar tipo de paciente
        const queryTipoPaciente = 'SELECT id, nombre FROM tipo_paciente';
        const resultadosTipoPaciente = await conexion(queryTipoPaciente, []);
        if (resultadosTipoPaciente.estatus === 'error') {
            reportError(__filename, new Date(), resultadosTipoPaciente.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: resultadosTipoPaciente.respuesta });
        }
        resultado.tipoPaciente = resultadosTipoPaciente.respuesta;

        // Consultar sexo
        const querySexo = 'SELECT id, valor AS nombre FROM sexo';
        const resultadosSexo = await conexion(querySexo, []);
        if (resultadosSexo.estatus === 'error') {
            reportError(__filename, new Date(), resultadosSexo.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: resultadosSexo.respuesta });
        }
        resultado.sexo = resultadosSexo.respuesta;

        return res.status(200).json({
            estatus: 'éxito',
            respuesta: {
                convenios: resultado.convenios,
                tipoCedula: resultado.tipoCedula,
                tipoPaciente: resultado.tipoPaciente,
                sexo: resultado.sexo
            }
        });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los datos: ' + error.message });
    }
});

module.exports = router;