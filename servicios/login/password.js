const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
    }

    try {
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }

        const username = req.session.usuario.usuario;

        const query = 'UPDATE usuario SET contrasena = ? WHERE nombre = ?';
        const resultados = await conexion(query, [newPassword, username]);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: resultados.respuesta });
        }

        res.status(200).json({ estatus: 'éxito', respuesta: 'Contraseña actualizada' });
    } catch (error) {
        res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor' });
    }
});

module.exports = router;
