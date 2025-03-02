const express = require('express');
const router = express.Router();

const moment = require('moment');
router.post('/', (req, res) => {
    const { codigo } = req.body;

    if (!codigo) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
    }

    const tiempoActual = moment().format('YYYY-MM-DD');
    const diferenciaTiempo = (tiempoActual - req.session.codigoRecuperacionHora) / 1000; // Diferencia en segundos
console.log(req.session.codigoRecuperacion);
    if (diferenciaTiempo > 300) { // Si han pasado más de 5 minutos
        return res.status(401).json({ estatus: 'error', respuesta: 'Código expirado' });
    }

    if (parseInt(codigo) == req.session.codigoRecuperacion) {
        return res.status(200).json({ estatus: 'éxito', respuesta: 'Código correcto' });
    } else {
        return res.status(401).json({ estatus: 'error', respuesta: 'Código incorrecto' });
    }
});

module.exports = router;

