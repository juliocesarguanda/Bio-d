const express = require('express');
const router = express.Router();

// Ruta para verificar si el usuario está logueado y devolver sus datos
router.get('/', (req, res) => {
    if (req.session.usuario) {
        res.status(200).json({ estatus: 'éxito', respuesta: req.session.usuario });
    } else {
        res.status(401).json({ estatus: 'error', respuesta: 'No hay usuario logueado' });
    }
});

module.exports = router;
