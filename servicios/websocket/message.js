const express = require('express');
const router = express.Router();
const { reportError } = require('../../utilidades/reporte.js');
const { sendMessage } = require('../../main.js');

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        sendMessage(
            message
        );
        res.status(200).json({ estatus: 'éxito', respuesta: 'message' });
    } catch (error) {
        reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: 'Error en el message' });
    }
});

module.exports = router;

