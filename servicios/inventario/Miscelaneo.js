const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const PDFDocument = require('pdfkit');
const path = require('path');
const logoPath = path.join(__dirname, '..', '..', 'dev', 'assets', 'img', 'png', 'logo_c.png');
const moment = require('moment');

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

router.post('/', async (req, res) => {



    try {
        if (!req.session.usuario) {
            return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
        }
        const queryMiscelaneos = "SELECT * FROM miscelaneo WHERE estatus = 1";
        const resultadosMiscelaneos = await conexion(queryMiscelaneos, []);

        if (resultadosMiscelaneos.estatus === 'error') {
            reportError(__filename, new Date(), resultadosMiscelaneos.respuesta, req.originalUrl, {});
            return res.status(500).json({ estatus: 'error', respuesta: 'Error al consultar los misceláneos' });
        }

        const doc = new PDFDocument({ margins: { top: 60, bottom: 50, left: 50, right: 50 }, bufferPages: true });
        const today = new Date();
        const dayNameEnglish = today.toLocaleDateString('es-VE', { weekday: 'long' });
        const monthNameEnglish = today.toLocaleDateString('es-VE', { month: 'long' });
        const formattedDate = `${dia[dayNameEnglish]} ${String(today.getDate()).padStart(2, '0')} ${mes[monthNameEnglish]} ${today.getFullYear()}`.toUpperCase();

        // Obtener el nombre del archivo desde el cliente
        const filename = `MISCELANEOS ${moment().format('DD-MM-YYYY')}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        doc.pipe(res);

        let index = 0;
        let startY = 111;
        let startX = 55;
        let cellPadding = 5;
        let maxHeight = 6;
        let startz = 95;
        let pag = 1

        const drawHeader = (pageNumber) => {

            doc.font('Helvetica-Bold')
                .fontSize(16)
                .fillColor('white');

            let width = doc.page.width;
            let height = 80;
            let footerHeight = 20; // Asegúrate de definir footerHeight

            // Dibujar el rectángulo azul
            doc.rect(0, 0, width, height)
                .fill('#2196F3');

            // Añadir el texto centrado
            doc.fillColor('white')
                .text(`MISCELÁNEOS ${formattedDate}`, 0, 0 + height / 2 + 8, {
                    width: width,
                    align: 'center'
                });

            const footerY = doc.page.height - doc.page.margins.bottom - footerHeight;

            doc.save()
                .fontSize(6)
                .fillColor('black')
                .text(
                    'Av. LOS LEONES. CENTRO EMPRESARIAL EL MOMOY, PLANTA ALTA, LOCAL # 10. BOCONÓ EDO. TRUJILLO. TLFS: 0272-6521256. BIO-DIAGNOSALUD@Hotmail.com',
                    50, footerY,
                    { align: 'center' }
                )
                .text(`Pg. ${pageNumber}`, doc.page.width - 50 - 30, footerY, { align: 'right' });

            doc.restore();




            text = doc.font('Helvetica-Bold').fillColor('black').fontSize(10).text('NOMBRE', startX + cellPadding, startz + cellPadding, { width: 250 - cellPadding * 2, align: 'center' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startz, 250, maxHeight + cellPadding * 2).stroke();
            startX += 250;

            text = doc.font('Helvetica-Bold').fontSize(10).text('CANTIDAD', startX + cellPadding, startz + cellPadding, { width: 250 - cellPadding * 2, align: 'center' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startz, 250, maxHeight + cellPadding * 2).stroke();
            startX = 55;

            doc.image(logoPath, 500, 15, { width: 100 });
        };

        // Llamar a la función
        drawHeader(pag);


        resultadosMiscelaneos.respuesta.map(r => {
            index++
            if (index > 35) {
                pag++
                doc.addPage();
                drawHeader(pag);
                startY = 111;
                index = 0
            }
            let text;
            text = doc.font('Helvetica').fillColor('black').fontSize(10).text(r.nombre, startX + cellPadding, startY + cellPadding, { width: 250 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 250, maxHeight + cellPadding * 2).stroke();
            startX += 250;

            text = doc.font('Helvetica').fontSize(10).text(r.cantidad, startX + cellPadding, startY + cellPadding, { width: 250 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 250, maxHeight + cellPadding * 2).stroke();
            startX += 250;

            // Avanza a la siguiente fila
            startY += maxHeight + cellPadding * 2;
            startX = 55;
        });

        doc.end();
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, {});
        res.status(500).json({ estatus: 'error', respuesta: 'Error al generar el PDF: ' + error.message });
    }
});

module.exports = router;
