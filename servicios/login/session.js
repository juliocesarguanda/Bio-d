const express = require('express');
const router = express.Router();

// Ruta para verificar si el usuario está logueado y devolver sus datos
router.post('/', (req, res) => {
    const { id } = req.body;
    if (req.session.usuario) {
        req.session.usuario.socketId = id;
        res.status(200).json({ estatus: 'éxito', respuesta: req.session.usuario });
    } else {
        res.status(401).json({ estatus: 'error', respuesta: 'No hay usuario logueado' });
    }
});

module.exports = router;
