const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.get('/', async (req, res) => {
    // Verificar si hay un usuario en la sesión
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }

    try {
        const query = `
            SELECT p.*, p.nombre AS nombre, p.apellido AS apellido, p.cedula AS cedula, p.fecha_nacimiento AS fecha_nacimiento, p.telefono AS telefono, p.id AS id, 
            tc.tipo AS tipo_cedula, tc.id AS tipo_cedulaId, c.id AS convenio, t.id AS tipo_paciente, sx.valor AS sexo, sx.id AS sexoId
            FROM paciente p
            LEFT JOIN tipo_cedula tc ON p.tipo_cedula = tc.id
            LEFT JOIN convenio c ON p.convenio = c.id
            LEFT JOIN tipo_paciente t ON p.tipo_paciente = t.id
            LEFT JOIN sexo sx ON p.sexo = sx.id
            WHERE p.estatus = 1
        `;
        const resultados = await conexion(query, []);

        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los pacientes' });
        }

        const resultado = resultados.respuesta.map(mostrar => ({
            cedula: mostrar.cedula,
            nombre: mostrar.nombre,
            apellido: mostrar.apellido,
            fecha: new Date(mostrar.fecha_nacimiento).toLocaleDateString("en-GB"),
            fecha2: mostrar.fecha_nacimiento,
            telefono: mostrar.telefono,
            id: mostrar.id,
            tipo_cedula: mostrar.tipo_cedula,
            tipo_cedulaId: mostrar.tipo_cedulaId,
            convenio: mostrar.convenio,
            paciente: mostrar.tipo_paciente,
            sexo: mostrar.sexo,
            sexoId: mostrar.sexoId
        }));

        res.json({ estatus: 'éxito', respuesta: resultado });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los pacientes: ' + error.message });
    }
});

module.exports = router;
