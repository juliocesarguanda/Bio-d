const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const query = `
            SELECT pe.*, p.nombre AS nombre, p.apellido AS apellido, p.id AS id, p.cedula AS cedula,
                   e.nombre AS tipo_examen, tc.tipo AS tipo_cedula, COUNT(e.id) AS cantidad_examenes, sx.valor AS sexo, SUM(pe.abonado) AS total_abonado, 
                   SUM(pe.precio) AS total_precio
            FROM paciente_examen pe
            LEFT JOIN paciente p ON pe.paciente = p.id
            LEFT JOIN examen e ON pe.examen = e.id 
            LEFT JOIN tipo_cedula tc ON p.tipo_cedula = tc.id
            LEFT JOIN sexo sx ON p.sexo = sx.id
            WHERE pe.estatus = 1
            GROUP BY p.cedula 
            ORDER BY p.nombre ASC 
        `;

        const resultados = await conexion(query);

        if (resultados.estatus !== 'éxito') {
            return res.status(500).json({ estatus: 'error', respuesta: 'Error en la consulta de datos' });
        }

        const resultado = resultados.respuesta.map(mostrar => {
            const cantidadExamenes = mostrar.cantidad_examenes;
            const estado = mostrar.total_abonado >= mostrar.total_precio ? 1 : 0;
            return {
                estado: estado,
                id: mostrar.id,
                abonado: mostrar.abonado,
                fecha: new Date(mostrar.fecha).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                hora: mostrar.hora,
                tipo_examen: cantidadExamenes == 1 ? mostrar.tipo_examen : cantidadExamenes,
                paciente: mostrar.paciente,
                nombre: mostrar.nombre,
                apellido: mostrar.apellido,
                cedula: mostrar.cedula,
                tipo_cedula: mostrar.tipo_cedula,
                sexo: mostrar.sexo
            };
        });

        return res.status(200).json(resultado);

    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;

