const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion');
const { sendEmail } = require('../../utilidades/emailUtil'); // Asegúrate de tener el módulo de enviar email
const { reportError } = require('../../utilidades/reporte');

const moment = require('moment');

router.post('/', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
    }

    try {
        const query = 'SELECT correo FROM usuario WHERE nombre = ?';
        const resultados = await conexion(query, [username]);

        if (resultados.estatus === 'error') {
            return res.status(500).json({ estatus: 'error', respuesta: resultados.respuesta });
        }

        if (resultados.respuesta.length === 0) {
            return res.status(404).json({ estatus: 'error', respuesta: 'Usuario no encontrado' });
        }

        const email = resultados.respuesta[0].correo;
        const codigoRecuperacion = Math.floor(100000 + Math.random() * 900000); // Generar código de 6 dígitos

        // Guardar el código, la hora y el nombre de usuario en la sesión
        req.session.codigoRecuperacion = codigoRecuperacion;
        req.session.codigoRecuperacionHora = moment().format('YYYY-MM-DD');
        req.session.usuario = { usuario: username };

        console.log(codigoRecuperacion);

        // Enviar el código por correo
        await sendEmail(email, 'Código de Recuperación', `Tu código de recuperación es: ${codigoRecuperacion}`);

        res.status(200).json({ estatus: 'éxito', respuesta: 'Código de recuperación enviado' });
    } catch (error) {
        res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor' });
    }
});

module.exports = router;



module.exports = router;
