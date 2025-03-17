const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;



        if (!username || !password) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const query = `
            SELECT *, usuario.contrasena AS contrasena, empleado.nombre AS nombre, 
            empleado.apellido AS apellido, empleado.id AS id, cargo.nombre AS cargo,
            usuario.tipo_usuario AS tipo, usuario.nombre AS usuario, usuario.id AS idu
            FROM usuario 
            INNER JOIN empleado ON usuario.id = empleado.id_usuario
            INNER JOIN cargo ON empleado.cargo = cargo.id
            WHERE usuario.nombre = ?
        `;
        const resultados = await conexion(query, [username]);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: resultados.respuesta });
        }

        if (resultados.respuesta.length === 0 || resultados.respuesta[0].contrasena !== password) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario o contraseña incorrectos' });
        }

        const usuario = resultados.respuesta[0];

        scanAndSendRequests('/websocket/message', {
            message: {
                codigo: '0001',
                usuario: username,
                tipo: usuario.tipo
            }
        });
        req.session.usuario = {
            id: usuario.id,
            idu: usuario.idu,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            usuario: usuario.usuario,
            tipo: usuario.tipo
        };

        res.status(200).json({ estatus: 'éxito', respuesta: 'Usuario autenticado y datos guardados en sesión' });
    } catch (error) {
        reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor' });
    }
});

module.exports = router;

