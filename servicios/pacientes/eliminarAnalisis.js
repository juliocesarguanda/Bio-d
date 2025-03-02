const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    const { nombre } = req.body;

    if (!nombre || !Array.isArray(nombre)) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
    }

    try {
        // Actualizar estatus de los exámenes seleccionados
        const sqlUpdate = `
            UPDATE paciente_examen
            SET estatus = 0 
            WHERE id IN (${nombre.map(() => '?').join(', ')})
        `;
        const resultUpdate = await conexion(sqlUpdate, nombre);

        if (resultUpdate.estatus !== 'éxito') {
            throw new Error('Error al actualizar los exámenes');
        }

        // Verificar si los exámenes tienen algún monto abonado
        const sqlAbonados = `
            SELECT id, paciente, abonado, precio 
            FROM paciente_examen
            WHERE id IN (${nombre.map(() => '?').join(', ')}) AND abonado > 0
        `;
        const resultAbonados = await conexion(sqlAbonados, nombre);

        if (resultAbonados.estatus !== 'éxito' || resultAbonados.respuesta.length === 0) {
            return res.json({ estatus: 'exito', respuesta: 'Análisis eliminados correctamente' });
        }

        const { abonado: abonadoTotal, paciente } = resultAbonados.respuesta[0];

        // Obtener exámenes del mismo paciente con estatus 1 y abonado < precio
        const sqlPendientes = `
            SELECT id, abonado, precio
            FROM paciente_examen
            WHERE paciente = ? AND estatus != 0 AND abonado < precio
        `;
        const resultPendientes = await conexion(sqlPendientes, [paciente]);

        if (resultPendientes.estatus !== 'éxito') {
            throw new Error('Error al obtener exámenes pendientes');
        }

        let devolucion = abonadoTotal;
        for (const pendiente of resultPendientes.respuesta) {
            const restante = pendiente.precio - pendiente.abonado;
            const aplicar = Math.min(restante, devolucion);
            const sqlAplicarAbono = `
                UPDATE paciente_examen
                SET abonado = abonado + ?
                WHERE id = ?
            `;
            const resultAplicarAbono = await conexion(sqlAplicarAbono, [aplicar, pendiente.id]);

            if (resultAplicarAbono.estatus !== 'éxito') {
                throw new Error('Error al aplicar abono a examen pendiente');
            }

            devolucion -= aplicar;
            if (devolucion <= 0) break;
        }

        if (devolucion > 0) {
            res.json({ estatus: 'exito', respuesta: `Análisis eliminados correctamente y con ${devolucion} BS de devolución` });
        } else {
            res.json({ estatus: 'exito', respuesta: 'Análisis eliminados correctamente' });
        }
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
