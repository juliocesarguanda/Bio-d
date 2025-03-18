const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    try {
        const {
            tipoCedula, cedula, nombre, apellido, usuario, contrasena, correo,
            idEmpleado, idUsuario, cargo, tipoUsuario
        } = req.body;

        if (!tipoCedula || !cedula || !nombre || !apellido || !usuario || !correo || !idEmpleado || !idUsuario || !cargo || !tipoUsuario) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const id_empleado = req.session.usuario.id;
        let existeEmpleado = 0;
        let existeUsuario = 0;

        // Verificar si el empleado ya existe
        const queryEmpleado = `SELECT * FROM empleado WHERE cedula = ? AND tipo_cedula = ? AND id != ?`;
        const resultadosEmpleado = await conexion(queryEmpleado, [cedula, tipoCedula, idEmpleado]);

        resultadosEmpleado.respuesta.forEach(mostrar => {
            if (mostrar.estatus == 1) {
                existeEmpleado = 1;
            } else if (mostrar.estatus == 0) {
                existeEmpleado = 2;
            }
        });

        // Verificar si el usuario ya existe
        const queryUsuario = `SELECT * FROM usuario WHERE nombre = ? AND id != ?`;
        const resultadosUsuario = await conexion(queryUsuario, [usuario, idUsuario]);

        resultadosUsuario.respuesta.forEach(mostrar => {
            if (mostrar.estatus == 1) {
                existeUsuario = 1;
            } else if (mostrar.estatus == 0) {
                existeUsuario = 2;
            }
        });

        if (existeEmpleado == 0 && existeUsuario == 0) {
            await conexion(`START TRANSACTION`);
            if (contrasena) {
                await conexion(`UPDATE usuario SET nombre = ?, contrasena = ?, correo = ?, tipo_usuario = ? WHERE id = ?`, [usuario, contrasena, correo, tipoUsuario, idUsuario]);
            } else {
                await conexion(`UPDATE usuario SET nombre = ?, correo = ?, tipo_usuario = ? WHERE id = ?`, [usuario, correo, tipoUsuario, idUsuario]);
            }

            await conexion(`UPDATE empleado SET tipo_cedula = ?, cedula = ?, cargo = ?, nombre = ?, apellido = ? WHERE id = ?`, [tipoCedula, cedula, cargo, nombre, apellido, idEmpleado]);

            await conexion(`COMMIT`);
            return res.status(200).json({ estatus: 'exito', respuesta: 'Exito al actualizar el usuario' });
        } else if (existeEmpleado != 0 || existeUsuario != 0) {
            let resultado = 'El usuario ya existe. Prueba otro nombre de usuario y cédula.';
            if (existeEmpleado != 0 && existeUsuario == 0) {
                resultado = 'El usuario ya existe. Prueba otra cédula.';
            } else if (existeEmpleado == 0 && existeUsuario != 0) {
                resultado = 'El usuario ya existe. Prueba otro nombre de usuario.';
            }

            return res.status(200).json({ estatus: 'info', respuesta: resultado });
        }
    } catch (error) {
        await conexion(`ROLLBACK`);
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
