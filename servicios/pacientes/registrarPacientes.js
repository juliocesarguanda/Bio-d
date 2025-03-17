const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

router.post('/', async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const id_empleado = req.session.usuario.id;
        const {
            nombre, apellido, tipoCedula, cedula,
            fechaNacimiento, convenio, paciente, telefono, sexo
        } = req.body;

        if (!nombre || !apellido || !tipoCedula || !cedula || !fechaNacimiento || !convenio || !paciente || !telefono || !sexo) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const sqlSelect = 'SELECT * FROM paciente WHERE tipo_cedula = ? AND cedula = ?';
        const resultadosSelect = await conexion(sqlSelect, [tipoCedula, cedula]);

        if (resultadosSelect.estatus === 'error') {
            reportError(__filename, new Date(), resultadosSelect.respuesta, req.originalUrl, req.body);
            return res.status(500).json({ estatus: 'error', respuesta: resultadosSelect.respuesta });
        }

        if (resultadosSelect.respuesta.length > 0) {
            const id = resultadosSelect.respuesta[0].id;
            const sqlUpdate = `
                UPDATE paciente SET 
                nombre = ?, apellido = ?, fecha_nacimiento = ?, telefono = ?, id_empleado = ?, 
                tipo_paciente = ?, sexo = ?, convenio = ?, estatus = 1 
                WHERE tipo_cedula = ? AND cedula = ?
            `;
            const resultadosUpdate = await conexion(sqlUpdate, [nombre, apellido, fechaNacimiento, telefono, id_empleado, paciente, sexo, convenio, tipoCedula, cedula]);

            if (resultadosUpdate.estatus === 'error') {
                reportError(__filename, new Date(), resultadosUpdate.respuesta, req.originalUrl, req.body);
                return res.status(500).json({ estatus: 'error', respuesta: resultadosUpdate.respuesta });
            }

            return res.status(200).json({ estatus: 'actualizar', respuesta: id });
        } else {
            const sqlInsert = `
                INSERT INTO paciente (tipo_cedula, cedula, nombre, apellido, fecha_nacimiento, telefono, id_empleado, tipo_paciente, convenio, sexo) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const resultadosInsert = await conexion(sqlInsert, [tipoCedula, cedula, nombre, apellido, fechaNacimiento, telefono, id_empleado, paciente, convenio, sexo]);

            if (resultadosInsert.estatus === 'error') {
                reportError(__filename, new Date(), resultadosInsert.respuesta, req.originalUrl, req.body);
                return res.status(500).json({ estatus: 'error', respuesta: resultadosInsert.respuesta });
            }
            scanAndSendRequests('/websocket/message', {
                message: {
                    codigo: '0012',
                    socketId: req.session.usuario.socketId
                }
            });
            return res.status(201).json({ estatus: 'insertar', respuesta: resultadosInsert.respuesta.insertId });
        }
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrio' });
    }
});

module.exports = router;
