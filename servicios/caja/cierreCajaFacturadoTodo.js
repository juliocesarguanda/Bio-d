const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const moment = require('moment');
const path = require('path');
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const logoPath = path.join(__dirname, '..', '..', 'dev', 'assets', 'img', 'png', 'logo_c.png');
const fechaActual = moment().format('YYYY-MM-DD');

const dia = {
    'Monday': 'LUNES',
    'Tuesday': 'MARTES',
    'Wednesday': 'MIÉRCOLES',
    'Thursday': 'JUEVES',
    'Friday': 'VIERNES',
    'Saturday': 'SÁBADO',
    'Sunday': 'DOMINGO'
};
const mes = {
    'January': 'ENERO',
    'February': 'FEBRERO',
    'March': 'MARZO',
    'April': 'ABRIL',
    'May': 'MAYO',
    'June': 'JUNIO',
    'July': 'JULIO',
    'August': 'AGOSTO',
    'September': 'SEPTIEMBRE',
    'October': 'OCTUBRE',
    'November': 'NOVIEMBRE',
    'December': 'DICIEMBRE'
};

const formatNumber = (number) => {
    return number.toFixed(2).replace(/\.?0+$/, '');
};

router.post('/', async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const query = `
            SELECT *, f.fecha AS fecha, p.valor AS Bolivar, 
            f.numeo_paciente_dia AS numeroPaciente, pa.nombre AS pa_nombre, 
            pa.apellido AS pa_apellido, pa.cedula AS pa_cedula, pa.telefono AS pa_telefono, 
            c.cantidad AS total, f.total AS ftotal, pa.id AS id_paciente, 
            tp.nombre AS tipo_pago, f.descuento AS descuentoF
            FROM factura f
            LEFT JOIN parametros p ON p.nombre = 'Bolivar'
            LEFT JOIN paciente pa ON f.paciente = pa.id
            LEFT JOIN caja c ON f.caja = c.id
            LEFT JOIN tipo_pago tp ON c.tipo_pago = tp.id
            WHERE f.numero != '0' AND f.fecha = '${fechaActual} ORDER BY f.fecha ASC'
        `;

        const resultados = await conexion(query, []);
        if (resultados.estatus === 'error') {
            reportError(__filename, new Date(), resultados.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar facturas' });
        }

        const doc = new PDFDocument({ margins: { top: 0, bottom: 0, left: 0, right: 0 }, bufferPages: true });
        const today = new Date();
        const dayNameEnglish = today.toLocaleDateString('es-VE', { weekday: 'long' });
        const monthNameEnglish = today.toLocaleDateString('es-VE', { month: 'long' });
        const formattedDate = `${dia[dayNameEnglish]} ${String(today.getDate()).padStart(2, '0')} ${mes[monthNameEnglish]} ${today.getFullYear()}`.toUpperCase();

        const filename = `CIERRE_CAJA_${formattedDate.replace(/ /g, '_')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        doc.pipe(res);

        let startX = 30;
        let cellPadding = 5;
        let maxHeight = 6;
        let currentPage = 1;
        let start = 0;
        let inde = 0;
        let startY = 100;
        const drawHeader = (pageNumber) => {

            let startY = 100;
            doc.save()
                .rect(0, 0, doc.page.width, 80)
                .fill('#2196F3')
                .font('Helvetica-Bold')
                .fontSize(16)
                .fillColor('white')
                .text(`CIERRE DE CAJA ${formattedDate}`, 0, 50, { align: 'center' })
                .image(logoPath, 500, 15, { width: 100 })

            doc.fontSize(6)
                .font('Helvetica')
                .fillColor('black')
                .text(`Av. LOS LEONES. CENTRO EMPRESARIAL EL MOMOY, PLANTA ALTA, LOCAL # 10. BOCONÓ EDO. TRUJILLO. TLFS: 0272-6521256. BIO-DIAGNOSALUD@Hotmail.com  Pg. ${pageNumber}`,
                    0, 730, { align: 'center' });

            // Encabezados de tabla principal




            text = doc.font('Helvetica-Bold').fillColor('black').fontSize(8).text('TIPO DE PAGO', startX + cellPadding, startY + cellPadding, { width: 185 - cellPadding * 2, align: 'center' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 185, maxHeight + cellPadding * 2).stroke();
            startX += 185;

            text = doc.fillColor('black').text('CANTIDAD', startX + cellPadding, startY + cellPadding, { width: 180 - cellPadding * 2, align: 'center' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 180, maxHeight + cellPadding * 2).stroke();
            startX += 180;

            text = doc.text('TOTAL', startX + cellPadding, startY + cellPadding, { width: 180 - cellPadding * 2, align: 'center' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 180, maxHeight + cellPadding * 2).stroke();
            startX = 30;

            const tiposPago = resultados.respuesta.reduce((acc, row) => {
                const key = row.tipo_pago;
                if (!acc[key]) acc[key] = { cantidad: 0, total: 0 };
                acc[key].cantidad++;
                acc[key].total += row.total * row.Bolivar;
                return acc;
            }, {});

            Object.entries(tiposPago).forEach(([tipo, { cantidad, total }]) => {


                startY += maxHeight + cellPadding * 2;
                text = doc.font('Helvetica').fillColor('#2196F3').fontSize(8).text(tipo, startX + cellPadding, startY + cellPadding, { width: 185 - cellPadding * 2, align: 'left' }).height;
                if (text > maxHeight) { maxHeight = text; }
                doc.rect(startX, startY, 185, maxHeight + cellPadding * 2).stroke();
                startX += 185;

                text = doc.text(cantidad.toString(), startX + cellPadding, startY + cellPadding, { width: 180 - cellPadding * 2, align: 'left' }).height;
                if (text > maxHeight) { maxHeight = text; }
                doc.rect(startX, startY, 180, maxHeight + cellPadding * 2).stroke();
                startX += 180;

                text = doc.text(formatNumber(total), startX + cellPadding, startY + cellPadding, { width: 180 - cellPadding * 2, align: 'left' }).height;
                if (text > maxHeight) { maxHeight = text; }
                doc.rect(startX, startY, 180, maxHeight + cellPadding * 2).stroke();
                startX = 30;

            });

            const totalGeneral = Object.values(tiposPago).reduce((acc, { total }) => acc + total, 0);
            startY += maxHeight + cellPadding * 2;
            text = doc.font('Helvetica-Bold').fillColor('#2196F3').fontSize(8).text('TOTAL GENERAL:', startX + cellPadding, startY + cellPadding, { width: 365 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 365, maxHeight + cellPadding * 2).stroke();
            startX += 365;

            text = doc.font('Helvetica').text(formatNumber(totalGeneral), startX + cellPadding, startY + cellPadding, { width: 180 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 180, maxHeight + cellPadding * 2).stroke();
            startX = 30;




            startY += 30;


            text = doc.font('Helvetica-Bold').fillColor('black').text('N°', startX + cellPadding, startY + cellPadding, { width: 25 - cellPadding * 2, align: 'center' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 25, maxHeight + cellPadding * 2).stroke();
            startX += 25;

            text = doc.text('PACIENTE', startX + cellPadding, startY + cellPadding, { width: 190 - cellPadding * 2, align: 'center' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 190, maxHeight + cellPadding * 2).stroke();
            startX += 190;

            text = doc.text('MONTO TOTAL', startX + cellPadding, startY + cellPadding, { width: 80 - cellPadding * 2, align: 'center' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 80, maxHeight + cellPadding * 2).stroke();
            startX += 80;

            text = doc.text('ABONO', startX + cellPadding, startY + cellPadding, { width: 90 - cellPadding * 2, align: 'center' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 90, maxHeight + cellPadding * 2).stroke();
            startX += 90;

            text = doc.text('RESTA', startX + cellPadding, startY + cellPadding, { width: 80 - cellPadding * 2, align: 'center' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 80, maxHeight + cellPadding * 2).stroke();
            startX += 80;

            text = doc.text('PAGO', startX + cellPadding, startY + cellPadding, { width: 80 - cellPadding * 2, align: 'center' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 80, maxHeight + cellPadding * 2).stroke();
            startX = 30;
            start = startY += maxHeight + cellPadding * 2;

        };

        drawHeader(currentPage);
        // // Procesar datos principales
        startY = start;
        resultados.respuesta.forEach((row) => {
            if (inde > 28) {
                inde = 0
                doc.addPage();
                currentPage++;
                startY = start;
                drawHeader(currentPage);
            }
            inde++;

            text = doc.font('Helvetica').fillColor('black').text(String(row.numeroPaciente).padStart(2, '0'), startX + cellPadding, startY + cellPadding, { width: 25 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 25, maxHeight + cellPadding * 2).stroke();
            startX += 25;

            text = doc.text(`${row.pa_nombre} ${row.pa_apellido}`, startX + cellPadding, startY + cellPadding, { width: 190 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 190, maxHeight + cellPadding * 2).stroke();
            startX += 190;

            text = doc.text(formatNumber(row.total * row.Bolivar), startX + cellPadding, startY + cellPadding, { width: 80 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 80, maxHeight + cellPadding * 2).stroke();
            startX += 80;

            text = doc.text(formatNumber(row.total * row.Bolivar), startX + cellPadding, startY + cellPadding, { width: 90 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 90, maxHeight + cellPadding * 2).stroke();
            startX += 90;

            text = doc.text(0, startX + cellPadding, startY + cellPadding, { width: 80 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 80, maxHeight + cellPadding * 2).stroke();
            startX += 80;

            text = doc.text(row.tipo_pago, startX + cellPadding, startY + cellPadding, { width: 80 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 80, maxHeight + cellPadding * 2).stroke();
            startX = 30;

            startY += maxHeight + cellPadding * 2;






        });


        doc.end();
    } catch (error) {
        console.log(error.message)
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: 'Error al generar el PDF: ' + error.message });
    }
});

module.exports = router;