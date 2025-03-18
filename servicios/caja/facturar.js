const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
    }

    try {
        // Obtener los datos de la factura
        const facturaResult = await conexion(`
            SELECT *, f.id AS id, pp.valor AS numero, f.fecha AS fecha, r.apellido AS apellido, r.nombre AS nombre, 
                   r.cedula AS cedula, tc.tipo AS tipo_cedula, p.valor AS Bolivar, f.numeo_paciente_dia AS numeroPaciente, 
                   pa.nombre AS pa_nombre, pa.apellido AS pa_apellido, pa.cedula AS pa_cedula, tcpa.tipo AS pa_tipo_cedula, 
                   r.telefono AS pa_telefono, c.cantidad AS total, co.nombre AS convenio, f.total AS ftotal, pa.id AS id_paciente, 
                   c.tipo_pago AS tipo_pago, f.descuento AS descuentoF
            FROM factura f
            LEFT JOIN razon_social r ON f.razon_social = r.id
            LEFT JOIN tipo_cedula tc ON r.tipo_cedula = tc.id
            LEFT JOIN parametros p ON p.nombre = 'Bolivar'
            LEFT JOIN parametros pp ON pp.nombre = 'factura'
            LEFT JOIN paciente pa ON f.paciente = pa.id
            LEFT JOIN tipo_cedula tcpa ON pa.tipo_cedula = tcpa.id
            LEFT JOIN caja c ON f.caja = c.id
            LEFT JOIN convenio co ON f.convenio = co.id
            WHERE f.id = ?
        `, [id]);

        if (facturaResult.estatus !== 'éxito') {
            throw new Error('Error en la consulta de la factura');
        }

        const facturaData = facturaResult.respuesta[0];

        // Obtener los exámenes de la factura
        const examenesResult = await conexion(`
            SELECT e.id AS id_examen, e.nombre AS nombre_examen, pe.precio AS precio, pe.bruto AS bruto, pe.descuento AS descuento, 
                   p.valor AS dolar
            FROM examen_factura ef
            LEFT JOIN paciente_examen pe ON ef.examen = pe.id
            LEFT JOIN examen e ON pe.examen = e.id
            LEFT JOIN parametros p ON p.nombre = 'Bolivar'
            WHERE ef.factura = ?
        `, [id]);

        if (examenesResult.estatus !== 'éxito') {
            throw new Error('Error en la consulta de los exámenes de la factura');
        }

        let totalMontoFactura = 0;
        let descuentoMontoFactura = 0;
        const examenesFactura = {};
        
        examenesResult.respuesta.forEach(row => {
            totalMontoFactura += row.bruto;
            descuentoMontoFactura += row.descuento;

            if (!examenesFactura[row.id_examen]) {
                examenesFactura[row.id_examen] = {
                    nombre_examen: row.nombre_examen,
                    precio: row.bruto * row.dolar,
                    monto: row.bruto * row.dolar,
                    cantidad: 1
                };
            } else {
                examenesFactura[row.id_examen].cantidad++;
                examenesFactura[row.id_examen].monto += row.bruto * row.dolar;
            }
        });

        const examenes = Object.values(examenesFactura);

        const tipoPagoResult = await conexion("SELECT * FROM tipo_pago");

        if (tipoPagoResult.estatus !== 'éxito') {
            throw new Error('Error en la consulta de los tipos de pago');
        }

        const formasPagoFactura = tipoPagoResult.respuesta.map(row => ({
            nombre: row.nombre,
            id: row.id
        }));

        let numero = facturaData.numero !== 'none' ? String(facturaData.numero).padStart(7, '0') : facturaData.numero;
        let descuentoProsentaje = 0;

        switch (facturaData.descuentoF) {
            case 2: descuentoProsentaje = 20; break;
            case 3: descuentoProsentaje = 30; break;
            case 4: descuentoProsentaje = 100; break;
        }

        const facturaFinal = {
            razonSocialNombre: `${facturaData.nombre} ${facturaData.apellido}`,
            razonSocialTipoCedula: facturaData.tipo_cedula,
            razonSocialCedula: facturaData.cedula,
            nombrePaciente: `${facturaData.pa_nombre} ${facturaData.pa_apellido}`,
            tipoCedulaPaciente: facturaData.pa_tipo_cedula,
            cedulaPaciente: facturaData.pa_cedula,
            fecha: new Date(facturaData.fecha).toLocaleDateString('es-VE'),
            factura: numero,
            numeroPaciente: String(facturaData.numeroPaciente).padStart(2, '0'),
            numeroTelefonoPaciente: facturaData.pa_telefono,
            convenioPaciente: facturaData.convenio,
            tasa: facturaData.Bolivar,
            examenes: examenes,
            montoDivisa: totalMontoFactura.toFixed(2),
            direccion: 'BOCONO',
            idFactura: id,
            idPaciente: facturaData.id_paciente,
            formaPago: facturaData.tipo_pago,
            formasPago: formasPagoFactura,
            descuentoProsentaje: descuentoProsentaje,
            totalFacturaBs: (totalMontoFactura * facturaData.Bolivar).toFixed(2),
            descuento: (descuentoMontoFactura * facturaData.Bolivar).toFixed(2),
            total: (totalMontoFactura * facturaData.Bolivar).toFixed(2)
        };

        return res.status(200).json({
            estatus: 'exito',
            respuesta: facturaFinal
        });
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
