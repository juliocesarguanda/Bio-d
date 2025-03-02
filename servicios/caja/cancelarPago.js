const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

const moment = require('moment');

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    const { tipoPago, cantidadPago, tipoCedulaPago, cedulaPago, nombrePago, apellidoPago, idPago, telefonoPago } = req.body;

    if (!tipoPago || !cantidadPago || !tipoCedulaPago || !cedulaPago || !nombrePago || !apellidoPago || !idPago || !telefonoPago) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
    }


    try {
        // Obtener los datos del paciente y sus exámenes pendientes
        const result = await conexion(`
            SELECT p.id AS id_paciente, p.nombre, tc.tipo AS tipo_cedula, tc.id AS tipo_cedula_id, p.apellido, p.cedula, 
                   pe.id AS id_examen, pe.precio, pe.descuento, pe.abonado, pe.fecha, pe.paciente_dia, pe.hora, 
                   p.convenio, p.tipo_paciente
            FROM paciente_examen pe
            LEFT JOIN paciente p ON pe.paciente = p.id
            LEFT JOIN tipo_cedula tc ON p.tipo_cedula = tc.id
            WHERE pe.estatus != 0 AND p.id = ?
            ORDER BY pe.id ASC
        `, [idPago]);

        if (result.estatus !== 'éxito') {
            throw new Error('Error al obtener los datos del paciente');
        }

        // Filtrar exámenes con abonado menor al precio
        const resultado = result.respuesta.filter(row => row.abonado < row.precio).map(row => ({
            id_examen: row.id_examen,
            precio: row.precio,
            descuento: row.descuento,
            abonado: row.abonado,
            restante: row.precio - row.abonado,
            paciente_dia: row.paciente_dia,
            convenio: row.convenio,
            tipo_paciente: row.tipo_paciente
        }));

        // Verificar si existe la razón social
        const razonSocial = await conexion(`
            SELECT * FROM razon_social WHERE cedula = ? AND tipo_cedula = ?
        `, [cedulaPago, tipoCedulaPago]);

        if (razonSocial.estatus !== 'éxito') {
            throw new Error('Error al verificar la razón social');
        }

        let idRazonSocial;
        if (razonSocial.respuesta.length > 0) {
            // Actualizar razón social existente
            idRazonSocial = razonSocial.respuesta[0].id;
            const updateRazon = await conexion(`
                UPDATE razon_social SET nombre = ?, apellido = ?, id_empleado = ?, telefono = ? WHERE id = ?
            `, [nombrePago, apellidoPago, req.session.usuario.id, telefonoPago, idRazonSocial]);

            if (updateRazon.estatus !== 'éxito') {
                throw new Error('Error al actualizar la razón social');
            }
        } else {
            // Insertar nueva razón social
            const insertRazon = await conexion(`
                INSERT INTO razon_social (tipo_cedula, cedula, nombre, apellido, id_empleado, telefono) 
                VALUES (?, ?, ?, ?, ?, ?)
            `, [tipoCedulaPago, cedulaPago, nombrePago, apellidoPago, req.session.usuario.id, telefonoPago]); 

            if (insertRazon.estatus !== 'éxito') {
                throw new Error('Error al insertar la razón social');
            }
            idRazonSocial = insertRazon.respuesta.insertId;
        }

        // Obtener parámetros (tasa de cambio y número de factura)
        const parametros = await conexion('SELECT * FROM parametros', []);
        if (parametros.estatus !== 'éxito') {
            throw new Error('Error al obtener los parámetros');
        }

        const exchange_rate = parametros.respuesta.find(p => p.nombre === 'Bolivar').valor;

        // Calcular pago en dólares
        const pago_dolares = cantidadPago / exchange_rate;

        // Verificar si existe una factura pendiente
        const factura = await conexion(`
            SELECT * FROM factura WHERE paciente = ? AND numero = '0'
        `, [idPago]);

        if (factura.estatus !== 'éxito') {
            throw new Error('Error al verificar la factura');
        }

        let idFactura, idCaja;
        if (factura.respuesta.length > 0) {
            idFactura = factura.respuesta[0].id;
            idCaja = factura.respuesta[0].caja;
        }

        // Calcular el abono y el sobrante
        let faltante_dolares = 0;
        let sobrante_dolares = pago_dolares;
        let total_abonado = 0;
        const paciente_examen = [];
        const examenCaja = [];

        for (const grupo of resultado) {
            if (sobrante_dolares >= grupo.restante) {
                examenCaja.push({ examen: grupo.id_examen });
                paciente_examen.push({ id: grupo.id_examen, abonado: grupo.restante });
                sobrante_dolares -= grupo.restante;
                total_abonado += grupo.restante;
            } else {
                paciente_examen.push({ id: grupo.id_examen, abonado: sobrante_dolares });
                total_abonado += sobrante_dolares;
                faltante_dolares += (grupo.restante - sobrante_dolares);
                sobrante_dolares = 0;
            }
        }

        const faltante_bolivares = faltante_dolares * exchange_rate;
        const sobrante_bolivares = sobrante_dolares * exchange_rate;

        // Actualizar el abonado en los exámenes
        for (const row of paciente_examen) {
            const updateAbonado = await conexion(`
                UPDATE paciente_examen SET abonado = abonado + ? WHERE id = ?
            `, [row.abonado, row.id]);

            if (updateAbonado.estatus !== 'éxito') {
                throw new Error('Error al actualizar el abonado');
            }
        }
let numeroFacturaFinal = '0';

if (faltante_bolivares.toFixed(2) > 0){
numeroFacturaFinal = 'none'
}
        // Insertar o actualizar la factura
        if (!idFactura) {
            // Insertar en caja
            const cajaInsert = await conexion(`
                INSERT INTO caja (cantidad, tipo_pago, id_empleado) VALUES (?, ?, ?)
            `, [total_abonado, tipoPago, req.session.usuario.id]);
            
            if (cajaInsert.estatus !== 'éxito') {
                throw new Error('Error al insertar en caja');
            }
            idCaja = cajaInsert.respuesta.insertId;

            // Insertar en factura
            const facturaInsert = await conexion(`
                INSERT INTO factura (numero, fecha, total, razon_social, caja, paciente, id_empleado, numeo_paciente_dia, convenio, descuento) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [numeroFacturaFinal, moment().format('YYYY-MM-DD'), total_abonado, idRazonSocial, idCaja, idPago, 1, resultado[0].paciente_dia, resultado[0].convenio, resultado[0].tipo_paciente]);

            if (facturaInsert.estatus !== 'éxito') {
                throw new Error('Error al insertar en factura');
            }
            idFactura = facturaInsert.respuesta.insertId;
        } else {
            // Actualizar caja
            const updateCaja = await conexion(`
                UPDATE caja SET cantidad = cantidad + ?, tipo_pago = ?, id_empleado = ? WHERE id = ?
            `, [total_abonado, tipoPago, req.session.usuario.id, idCaja]); 
            
            if (updateCaja.estatus !== 'éxito') {
                throw new Error('Error al actualizar caja');
            }

            // Actualizar factura
            const updateFactura = await conexion(`
                UPDATE factura SET 
                numero = ?,
                fecha = ?, 
                total = total + ?, 
                razon_social = ?, 
                id_empleado = ? 
                WHERE id = ?
            `, [ numeroFacturaFinal, moment().format('YYYY-MM-DD'), total_abonado, idRazonSocial, req.session.usuario.id, idFactura]); 
            
            if (updateFactura.estatus !== 'éxito') {
                throw new Error('Error al actualizar factura');
            }
        }

        // Insertar en examen_factura
        for (const examen of examenCaja) {
            const insertExamenFactura = await conexion(`
                INSERT INTO examen_factura (examen, factura) VALUES (?, ?)
            `, [examen.examen, idFactura]);

            if (insertExamenFactura.estatus !== 'éxito') {
                throw new Error('Error al insertar en examen_factura');
            }
        }


        // Respuesta exitosa
        res.json({
            estatus: 'exito',
            respuesta: {
                factura: idFactura,
                faltante: faltante_bolivares.toFixed(2),
                sobrante: sobrante_bolivares.toFixed(2)
            }
        });
    } catch (error) {
        reportError(__filename, moment().format('YYYY-MM-DD'), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;