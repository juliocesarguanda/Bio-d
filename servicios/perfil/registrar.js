const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    try {
        const { tipoCedula, cedula, nombre, apellido, usuario, contrasena, cargo, tipoUsuario, correo } = req.body;

        if (!tipoCedula || !cedula || !nombre || !apellido || !usuario || !contrasena || !cargo || !tipoUsuario || !correo) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const id_empleado = req.session.usuario.id;
        let existeEmpleado = 0;
        let existeUsuario = 0;
        let idEmp = '';
        let idUsu = '';

        // Verificar si el empleado ya existe
        const queryEmpleado = `SELECT * FROM empleado WHERE cedula = ? AND tipo_cedula = ?`;
        const resultadosEmpleado = await conexion(queryEmpleado, [cedula, tipoCedula]);

        resultadosEmpleado.respuesta.forEach(mostrar => {
            if (mostrar.estatus == 1) {
                existeEmpleado = 1;
            } else if (mostrar.estatus == 0) {
                existeEmpleado = 2;
                idEmp = mostrar.id;
            }
        });

        // Verificar si el usuario ya existe
        const queryUsuario = `SELECT * FROM usuario WHERE nombre = ?`;
        const resultadosUsuario = await conexion(queryUsuario, [usuario]);

        resultadosUsuario.respuesta.forEach(mostrar => {
            if (mostrar.estatus == 1) {
                existeUsuario = 1;
            } else if (mostrar.estatus == 0) {
                existeUsuario = 2;
                idUsu = mostrar.id;
            }
        });

        if (existeEmpleado == 0 && existeUsuario == 0) {
            // Iniciar una transacción
            await conexion(`START TRANSACTION`);

            const queryInsertUsuario = `
                INSERT INTO usuario (nombre, contrasena, correo, tipo_usuario) 
                VALUES (?, ?, ?, ?)
            `;
            const resultadosInsertUsuario = await conexion(queryInsertUsuario, [usuario, contrasena, correo, tipoUsuario]);
            const idusuario = resultadosInsertUsuario.respuesta.insertId; // Obtener el ID del usuario insertado

            const queryInsertEmpleado = `
                INSERT INTO empleado (tipo_cedula, cedula, cargo, nombre, apellido, id_usuario, registrado) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            await conexion(queryInsertEmpleado, [tipoCedula, cedula, cargo, nombre, apellido, idusuario, id_empleado]);

            // Confirmar la transacción
            await conexion(`COMMIT`);
            return res.status(200).json({ estatus: 'exito' });
        } else if (existeEmpleado == 2) {
            // Iniciar una transacción
            await conexion(`START TRANSACTION`);
            await conexion(`UPDATE usuario SET estatus = 1 WHERE id = ?`, [idUsu]);
            await conexion(`UPDATE empleado SET estatus = 1 WHERE id = ?`, [idEmp]);
            // Confirmar la transacción
            await conexion(`COMMIT`);

            return res.status(200).json({ estatus: 'info', respuesta: 'El usuario se ha reactivado, no registrado ni actualizado' });
        } else {
            let resultado = 'El usuario ya existe. Prueba otro nombre de usuario y cédula.';
            if (existeEmpleado != 0 && existeUsuario == 0) {
                resultado = 'El usuario ya existe. Prueba otra cédula.';
            } else if (existeEmpleado == 0 && existeUsuario != 0) {
                resultado = 'El usuario ya existe. Prueba otro nombre de usuario.';
            }

            return res.status(200).json({ estatus: 'info', respuesta: resultado });
        }
    } catch (error) {
        // En caso de error, revertir la transacción
        await conexion(`ROLLBACK`);
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
