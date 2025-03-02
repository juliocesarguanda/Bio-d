const express = require('express');
const router = express.Router();

// Ruta para cerrar sesión
router.post('/', (req, res) => {
    // Destruye la sesión del usuario
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ estatus: 'error', respuesta: 'No se pudo cerrar la sesión' });
        }

        res.status(200).json({ estatus: 'éxito', respuesta: 'Sesión cerrada correctamente' });
    });
});

module.exports = router;
