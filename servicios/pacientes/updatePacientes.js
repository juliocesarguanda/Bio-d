const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    const { nombre, apellido, tipoCedula, cedula, fechaNacimiento, convenio, paciente, telefono, idUpdate, sexo } = req.body;

    if (!nombre || !apellido || !tipoCedula || !cedula || !fechaNacimiento || !convenio || !paciente || !telefono || !sexo || !idUpdate) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
    }

    try {
        // Obtener id_empleado de la sesión
        const id_empleado = req.session.usuario ? req.session.usuario.id : null;
        if (!id_empleado) {
            return res.status(401).json({ estatus: 'error', respuesta: 'No autorizado' });
        }

        // Actualizar paciente
        const sqlUpdate = `
            UPDATE paciente 
            SET tipo_cedula = ?, cedula = ?, nombre = ?, apellido = ?, fecha_nacimiento = ?, telefono = ?, 
                id_empleado = ?, tipo_paciente = ?, convenio = ?, sexo = ? 
            WHERE id = ?
        `;
        const paramsUpdate = [tipoCedula, cedula, nombre, apellido, fechaNacimiento, telefono, id_empleado, paciente, convenio, sexo, idUpdate];
        const resultUpdate = await conexion(sqlUpdate, paramsUpdate);

        if (resultUpdate.estatus !== 'éxito') {
            throw new Error('Error al actualizar paciente');
        }


        res.json({ estatus: 'exito' , respuesta: 'Éxito al actualizar el paciente'});
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
