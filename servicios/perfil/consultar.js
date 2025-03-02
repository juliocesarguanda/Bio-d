const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

// Ruta para consultar empleados
router.post('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    const id_empleado = req.session.usuario.id;
    const tipo_usuario = req.session.usuario.tipo; // Obtener el tipo de usuario desde la sesión

    try {
        let query = `
            SELECT  e.nombre AS nombre, e.apellido AS apellido, e.cedula AS cedula, 
                   e.cargo AS id_cargo, c.nombre AS nombre_cargo, e.id AS id_empleado, 
                   u.id AS id_usuario, tc.tipo AS tipo_cedula, tc.id AS tipo_cedulaId, 
                   u.correo AS correo, u.tipo_usuario AS id_tipo_usuario, t.nombre AS tipo_usuario, 
                   u.nombre AS nombre_usuario
            FROM empleado e
            LEFT JOIN tipo_cedula tc ON e.tipo_cedula = tc.id
            LEFT JOIN cargo c ON e.cargo = c.id
            LEFT JOIN usuario u ON e.id_usuario = u.id
            LEFT JOIN tipo_usuario t ON u.tipo_usuario = t.id
            WHERE e.estatus = 1
        `;

        // Ajustar la consulta si el usuario es de tipo 2 para mostrar solo sus propios datos
        if (tipo_usuario == 2) {
            query += ` AND e.id = ${id_empleado}`;
        }

        const resultados = await conexion(query, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'ups. Algo ocurrió' });
        }

        const resultado = resultados.respuesta.map(mostrar => ({
            id_empleado: mostrar.id_empleado,
            id_usuario: mostrar.id_usuario,
            id_tipo_cedula: mostrar.tipo_cedulaId,
            tipo_cedula: mostrar.tipo_cedula,
            cedula: mostrar.cedula,
            nombre: mostrar.nombre,
            apellido: mostrar.apellido,
            id_cargo: mostrar.id_cargo,
            cargo: mostrar.nombre_cargo,
            correo: mostrar.correo,
            id_tipo_usuario: mostrar.id_tipo_usuario,
            tipo_usuario: mostrar.tipo_usuario,
            nombre_usuario: mostrar.nombre_usuario
        }));

        res.json({ estatus: 'éxito', respuesta: resultado });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: 'Error en el servidor: ' + error.message });
    }
});

module.exports = router;
