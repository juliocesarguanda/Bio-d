const express = require('express');
const router = express.Router();
const moment = require('moment');
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { scanAndSendRequests } = require('../../utilidades/mensajesInterno.js');

router.post('/', async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const { paciente, examenes } = req.body;

        if (!paciente || !Array.isArray(examenes) || examenes.length === 0) {
            return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        }

        const fecha = moment().format('YYYY-MM-DD');
        const hora = new Date().toTimeString().split(' ')[0];
        let numeroPaciente = 0;
        let tipoPaciente = 0;
        let dolar = 0;
        let feriado = { valor: 0, tiempo: '' };

        // Obtener parámetros y otros datos necesarios en una sola consulta
        const queryParametros = `
            SELECT 
                p.valor AS dolar, 
                f.valor AS feriado, 
                f.tiempo AS tiempo, 
                pa.tipo_paciente, 
                (
                    SELECT MAX(paciente_dia) 
                    FROM paciente_examen 
                    WHERE estatus != 0 AND fecha = ?
                ) AS maxPacienteDia,
                (
                    SELECT paciente_dia 
                    FROM paciente_examen 
                    WHERE paciente = ? 
                      AND estatus != 0 
                      AND fecha = ? 
                    LIMIT 1
                ) AS pacienteDia
            FROM parametros p
            LEFT JOIN parametros f ON f.nombre = 'feriado'
            LEFT JOIN paciente pa ON pa.id = ?
            WHERE p.nombre = 'Bolivar'
        `;
        const resultadosParametros = await conexion(queryParametros, [fecha, paciente, fecha, paciente]);
        if (resultadosParametros.estatus !== 'éxito') {
            return res.status(500).json({ estatus: 'error', respuesta: 'Error en la consulta de datos' });
        }

        const [dataParametros] = resultadosParametros.respuesta;

        if (!dataParametros) {
            return res.status(500).json({ estatus: 'error', respuesta: 'Datos no encontrados' });
        }

        dolar = dataParametros.dolar;
        feriado = { valor: dataParametros.feriado, tiempo: dataParametros.tiempo };
        tipoPaciente = dataParametros.tipo_paciente;
        numeroPaciente = dataParametros.maxPacienteDia ? dataParametros.maxPacienteDia + 1 : 1;
        if (dataParametros.pacienteDia) {
            numeroPaciente = dataParametros.pacienteDia;
        }

        const esFeriado = (feriado.valor == 1 && feriado.tiempo.split('T')[0] === fecha);
        const esFeriado2 = (new Date().getDay() === 0);

        // Obtener precios de exámenes en una consulta separada
        const queryExamenes = `
            SELECT id, precio 
            FROM examen 
            WHERE estatus != 0
        `;
        const resultadosExamenes = await conexion(queryExamenes, [examenes]);
        if (resultadosExamenes.estatus !== 'éxito') {
            return res.status(500).json({ estatus: 'error', respuesta: 'Error en la consulta de precios de exámenes' });
        }

        const precios = {};
        resultadosExamenes.respuesta.forEach(row => {
            precios[row.id] = row.precio;
        });

        const insertValues = [];
        examenes.forEach(examen => {
            let precioBruto = precios[examen];
            let precio = precioBruto;
            let descuento = 0;

            if (esFeriado || esFeriado2 || hora >= '19:00' || hora <= '03:00') {
                precioBruto *= 1.30;
            }

            if (tipoPaciente == 2) {
                descuento = 0.20 * precioBruto;
            } else if (tipoPaciente == 3) {
                descuento = 0.30 * precioBruto;
            } else if (tipoPaciente == 4) {
                descuento = precioBruto;
            }
            precio = precioBruto - descuento;

            insertValues.push([fecha, hora, examen, paciente, numeroPaciente, precio, precioBruto, descuento]);
        });

        const queryInsertar = `
            INSERT INTO paciente_examen (fecha, hora, examen, paciente, paciente_dia, precio, bruto, descuento) 
            VALUES ${insertValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(',')}
        `;
        const flattenedInsertValues = insertValues.flat();
        const insertResult = await conexion(queryInsertar, flattenedInsertValues);

        if (insertResult.estatus !== 'éxito') {
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al insertar los exámenes' });
        }

        scanAndSendRequests('/websocket/message', {
            message: {
                codigo: '00##',
                socketId: req.session.usuario.socketId
            }
        });
        return res.status(200).json({ estatus: 'éxito', respuesta: 'Análisis agregado correctamente' });

    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
