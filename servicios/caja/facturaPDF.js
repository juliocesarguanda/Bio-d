const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

// Configuración de medidas

const FONTSIZEPAGE = 7.5;
const mmToPoints = (mm) => mm * 2.83465;
const PAGE = {
    width: mmToPoints(216),
    height: mmToPoints(356),
    margins: {
        left: mmToPoints(15),
        top: mmToPoints(15)
    }
};

function format_number(number) {
    return parseFloat(number).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
}



router.post('/', async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const { IdFactura } = JSON.parse(req.body.data);
        if (!IdFactura) return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        // Obtener datos de la factura
        const facturaQuery = `
            SELECT f.id AS id, f.numero AS numero, f.fecha AS fecha, r.apellido AS apellido, r.nombre AS nombre, 
                   r.cedula AS cedula, tc.tipo AS tipo_cedula, p.valor AS Bolivar, f.numeo_paciente_dia AS numeroPaciente, 
                   pa.nombre AS pa_nombre, pa.apellido AS pa_apellido, pa.cedula AS pa_cedula, tcpa.tipo AS pa_tipo_cedula, 
                   r.telefono AS pa_telefono, c.cantidad AS total, co.nombre AS convenio, f.total AS ftotal, 
                   pa.id AS id_paciente, c.tipo_pago AS tipo_pago, f.descuento AS descuentoF
            FROM factura f
            LEFT JOIN razon_social r ON f.razon_social = r.id
            LEFT JOIN tipo_cedula tc ON r.tipo_cedula = tc.id
            LEFT JOIN parametros p ON p.nombre = 'Bolivar'
            LEFT JOIN paciente pa ON f.paciente = pa.id
            LEFT JOIN tipo_cedula tcpa ON pa.tipo_cedula = tcpa.id
            LEFT JOIN caja c ON f.caja = c.id
            LEFT JOIN convenio co ON f.convenio = co.id
            WHERE f.id = ?`;

        const facturaResult = await conexion(facturaQuery, [IdFactura]);
        if (facturaResult.estatus !== 'éxito') throw new Error(facturaResult.respuesta);
        const facturaData = facturaResult.respuesta[0];

        // Obtener exámenes
        const examenesQuery = `
            SELECT e.id AS id_examen, e.nombre AS nombre_examen, pe.precio AS precio, pe.bruto AS bruto, 
                   pe.descuento AS descuento, p.valor AS dolar
            FROM examen_factura ef
            LEFT JOIN paciente_examen pe ON ef.examen = pe.id
            LEFT JOIN examen e ON pe.examen = e.id
            LEFT JOIN parametros p ON p.nombre = 'Bolivar'
            WHERE ef.factura = ?`;

        const examenesResult = await conexion(examenesQuery, [IdFactura]);
        if (examenesResult.estatus !== 'éxito') throw new Error(examenesResult.respuesta);



        const tipoPago = `
        SELECT id, nombre
        FROM tipo_pago`;

        const tipoPagoResult = await conexion(tipoPago, []);
        if (tipoPagoResult.estatus !== 'éxito') throw new Error(tipoPagoResult.respuesta);





        // Procesar datos
        const procesarDatos = () => {
            const tasa = parseFloat(facturaData.Bolivar);
            let totalMontoFactura = 0;
            let descuentoMonto = 0;

            const examenes = examenesResult.respuesta.reduce((acc, row) => {
                totalMontoFactura += row.bruto;
                descuentoMonto += row.descuento;

                const examenExistente = acc.find(e => e[1] === row.nombre_examen); // Índice 0 para nombre_examen
                if (examenExistente) {
                    examenExistente[1]++; // Índice 1 para cantidad
                    examenExistente[3] += row.bruto * row.dolar; // Índice 3 para monto
                } else {
                    acc.push([
                        1, // Índice 1 para cantidad
                        row.nombre_examen, // Índice 0 para nombre_examen
                        row.bruto * row.dolar, // Índice 2 para precio
                        row.bruto * row.dolar // Índice 3 para monto
                    ]);
                }
                return acc;
            }, []);

            return { tasa, examenes, totalMontoFactura, descuentoMonto };
        };



        const { tasa, examenes, totalMontoFactura, descuentoMonto } = procesarDatos();

        // Configurar PDF
        const doc = new PDFDocument({
            margin: 0,
            size: [PAGE.width, PAGE.height],
            layout: 'portrait'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=factura_${IdFactura}.pdf`);
        doc.pipe(res);

        function agregarTabla(doc, data, x, y, colWidths, alignments, cellPadding, HelveticaText) {
            let startX = x;
            let startY = y;

            // Recorrer las filas de la tabla
            data.forEach((row) => {
                let maxHeight = 0;

                // Recorrer las celdas de la fila
                row.forEach((cell, colIndex) => {
                    // Definir el ancho de la celda basado en el array colWidths
                    const cellWidth = colWidths[colIndex];

                    // Agregar contenido a la celda con la alineación especificada
                    const text = doc.font(HelveticaText[colIndex]).fontSize(FONTSIZEPAGE).text(cell, startX + cellPadding, startY + cellPadding, { width: cellWidth - cellPadding * 2, align: alignments[colIndex] }).height;

                    if (text > maxHeight) {
                        maxHeight = text;
                    }
                    // doc.rect(startX, startY, cellWidth, maxHeight + cellPadding * 2).stroke();
                    // Avanza a la siguiente celda
                    startX += cellWidth;
                });

                // Avanza a la siguiente fila
                startY += maxHeight + cellPadding * 2;
                startX = x;
            });
        }
        // Función para crear secciones idénticas
        const crearSeccionFactura = (startY) => {
            doc.fontSize(FONTSIZEPAGE)
                .font('Helvetica-Bold')
                .text('FACTURA:    ', PAGE.margins.left + 417, startY + 13)
                .font('Helvetica')
                .text(String(facturaData.numero).padStart(7, '0'), PAGE.margins.left + 465, startY + 13)
                .font('Helvetica-Bold')
                .text('NOMBRE O RAZON SOCIAL: ', PAGE.margins.left + 13, startY + 23.2)
                .font('Helvetica')
                .text(facturaData.nombre + ' ' + facturaData.apellido, PAGE.margins.left + 118, startY + 23.2)
                .font('Helvetica-Bold')
                .text('DIRECCION:', PAGE.margins.left + 13, startY + 45)
                .font('Helvetica')
                .text('BOCONO', PAGE.margins.left + 59, startY + 45)
                .font('Helvetica-Bold')
                .text('TELEFONO: ', PAGE.margins.left + 13, startY + 57)
                .font('Helvetica')
                .text(facturaData.pa_telefono, PAGE.margins.left + 59, startY + 57)
                .font('Helvetica-Bold')
                .text('PACIENTE: ', PAGE.margins.left + 13, startY + 69)
                .font('Helvetica')
                .text(facturaData.pa_nombre + ' ' + facturaData.pa_apellido, PAGE.margins.left + 59, startY + 69)
                .font('Helvetica-Bold')
                .text(`RIF/Ced.V-`, PAGE.margins.left + 257, startY + 69)
                .font('Helvetica')
                .text(facturaData.pa_cedula, PAGE.margins.left + 320, startY + 69)
                .font('Helvetica-Bold')
                .text(`RIF/Ced.V-`, PAGE.margins.left + 327, startY + 23.2)
                .font('Helvetica')
                .text(facturaData.pa_cedula, PAGE.margins.left + 390, startY + 23.2)
                .font('Helvetica-Bold')
                .text(`FECHA:`, PAGE.margins.left + 447, startY + 23.2)
                .font('Helvetica')
                .text(new Date(facturaData.fecha).toLocaleDateString('es-VE'), PAGE.margins.left + 487, startY + 23.2)
                .font('Helvetica-Bold')
                .text(`CONVENIO:`, PAGE.margins.left + 327, startY + 57)
                .font('Helvetica')
                .text(facturaData.convenio, PAGE.margins.left + 371, startY + 57)
                .text(String(facturaData.numeroPaciente).padStart(2, '0'), PAGE.margins.left + 490, startY + 69)
                .font('Helvetica-Bold')
                .text(`TASA BCV BsD:`, PAGE.margins.left + 220, startY + 270)
                .font('Helvetica')
                .text(tasa, PAGE.margins.left + 310, startY + 270)
                .font('Helvetica-Bold')
                .text(`FORMA DE PAGO:`, PAGE.margins.left + 40, startY + 195)
                .font('Helvetica-Bold')
                .text(`CANTIDAD`, PAGE.margins.left + 22, startY + 82)
                .text(`DESCRIPCION DE ANALISIS`, PAGE.margins.left + 135, startY + 82)
                .text(`PRECIO UNITARIO`, PAGE.margins.left + 314, startY + 82)
                .text(`MONTO`, PAGE.margins.left + 451, startY + 82);






            const data = [];

            tipoPagoResult.respuesta.forEach(row => {
                data.push([
                    row.nombre,
                    row.id == facturaData.tipo_pago ? 'X' : ''
                ]);
            });
            // Datos de ejemplo para la tabla

            const data2 = [
                ['TOTAL EXENTO Bs:', format_number(facturaData.ftotal * tasa)],
                [facturaData.descuentoF == 1 ? '0% DESCUENTO:' : facturaData.descuentoF == 2 ? '20% DESCUENTO:' : facturaData.descuentoF == 3 ? '30% DESCUENTO:' : facturaData.descuentoF == 4 ? '100% DESCUENTO:' : 'DESCUENTO:', format_number(parseFloat(descuentoMonto) * tasa)],
                ['SUB-TOTAL Bs:', format_number(facturaData.ftotal * tasa)],
                ['TOTAL FACTURA Bs:', format_number(facturaData.ftotal * tasa)],
                ['MONTO EN DIVISAS $:', format_number(totalMontoFactura)]
            ];


            agregarTabla(doc, data, PAGE.margins.left + 40, startY + 200, [90, 20], ['left', 'right'], 4, ['Helvetica', 'Helvetica']);

            agregarTabla(doc, data2, PAGE.margins.left + 361, startY + 213, [90, 61], ['right', 'right'], 4, ['Helvetica-Bold', 'Helvetica']);

            agregarTabla(doc, examenes, PAGE.margins.left - 8, startY + 86, [96, 195, 125, 115], ['center', 'left', 'right', 'right'], 4, ['Helvetica', 'Helvetica', 'Helvetica', 'Helvetica']);

        };

        // Primera sección (Original)
        crearSeccionFactura(100);

        // Segunda sección (Copia)
        crearSeccionFactura(554); // Ajuste preciso de espacio entre secciones

        doc.end();

    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Error generando PDF' });
    }
});

module.exports = router;