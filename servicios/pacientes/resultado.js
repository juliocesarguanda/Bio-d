const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit-table');
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const { Buffer } = require('buffer');

const path = require('path');
const logoPath = path.join(__dirname, '..', '..', 'dev', 'assets', 'img', 'png', 'logo.png');
// Configuración de medidas
const mmToPoints = (mm) => mm * 2.83465;
const PAGE = {
    width: mmToPoints(210),
    height: mmToPoints(297),
    margins: {
        left: mmToPoints(10),
        top: mmToPoints(10)
    }
};

function calcularEdad(fechaNacimiento) {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
}

router.post('/', async (req, res) => {
    try {
        const { idResultado, qr } = JSON.parse(req.body.data);
        if (!idResultado || !qr) return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
        // Obtener datos del resultado
        const queryResultado = `
            SELECT 
                pe.id AS paciente_examen_id,
                pe.paciente,
                pe.fecha AS fecha,
                pe.paciente_dia,
                eph.id AS examen_paciente_historial_id,
                eph.valor AS valor,
                eph.referencia AS referencia,
                hp.nota,
                p.cedula,
                p.nombre AS paciente_nombre,
                p.apellido,
                p.fecha_nacimiento AS fecha_nacimiento,
                sx.valor AS sexo_valor,
                tc.tipo AS tipo_cedula_tipo,
                e.nombre AS examen_nombre,
                an.nombre AS analisis_nombre,
                s.nombre AS servicio_nombre,
                c.nombre AS convenio_nombre,
                ca.nombre AS cargo,
                em.nombre AS analista_nombre,
                em.apellido AS analista_apellido,
                f.numero AS numero,
                eph.examen AS id

            FROM paciente_examen pe
            LEFT JOIN examen_paciente_historial eph ON pe.id = eph.examen
            LEFT JOIN analisis an ON eph.analisis = an.id
            LEFT JOIN historial_paciente hp ON eph.id_historial = hp.id
            LEFT JOIN paciente p ON pe.paciente = p.id
            LEFT JOIN examen e ON pe.examen = e.id
            LEFT JOIN examen_factura ef ON pe.id = ef.examen
            LEFT JOIN factura f ON ef.factura = f.id
            LEFT JOIN servicio s ON hp.servicio = s.id
            LEFT JOIN convenio c ON hp.remitida = c.id
            LEFT JOIN sexo sx ON p.sexo = sx.id
            LEFT JOIN tipo_cedula tc ON p.tipo_cedula = tc.id
            LEFT JOIN empleado em ON hp.id_empleado = em.id
            LEFT JOIN cargo ca ON em.cargo = ca.id

            

            WHERE eph.id_historial IN (
                SELECT id_historial
                FROM examen_paciente_historial
                WHERE examen = ?
            )
      ORDER BY eph.examen ASC`;


        const resultado = await conexion(queryResultado, [idResultado]);
        if (resultado.estatus !== 'éxito') throw new Error(resultado.respuesta);
        const datos = resultado.respuesta[0];
        // Procesar datos
        const fecha = new Date(datos.fecha).toLocaleDateString('es-VE');
        const edad = calcularEdad(datos.fecha_nacimiento);
        const numeroPaciente = String(datos.paciente_dia).padStart(2, '0');
        const nombreCompleto = `${datos.paciente_nombre} ${datos.apellido}`;
        const analista = `${datos.analista_nombre} ${datos.analista_apellido}`;
        const qrBuffer = Buffer.from(qr.replace(/^data:image\/png;base64,/, ''), 'base64');
        // Crear PDF
        const doc = new PDFDocument({
            margin: 0,
            size: [PAGE.width, PAGE.height],
            layout: 'portrait'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=examen ${datos.tipo_cedula_tipo}${datos.cedula} ${datos.paciente_nombre} ${datos.apellido} ${fecha}.pdf`);
        doc.pipe(res);

        // Configuración inicial
        const crearSeccion = () => {

            doc.font('Helvetica-Bold').fontSize(12)
                .text(`Nº ${numeroPaciente}`, PAGE.margins.left + 500, 30)
                .fillColor('#ff8000').fontSize(12).text('LABORATORIO CLINICO BIO-DIAGNOSALUD C.A.', PAGE.margins.left - 5, 45, { align: 'center' })
                .fillColor('#000000').fontSize(11).text(`NOMBRE: ${nombreCompleto}`, PAGE.margins.left + 3, 87)
                .text(`FECHA: ${fecha} EDAD: ${edad} AÑOS SEXO: (${datos.sexo_valor})`, PAGE.margins.left + 3, 100)
                .text(`CÉDULA DE IDENTIDAD: ${datos.tipo_cedula_tipo}${datos.cedula}`, PAGE.margins.left + 3, 113)
                .text(`REMITIDA: ${datos.convenio_nombre}`, PAGE.margins.left + 3, 126)
                .text(`SERVICIO: ${datos.servicio_nombre}`, PAGE.margins.left + 3, 139)
                .image(logoPath, PAGE.width - 130, 60, { width: 90 })
                .font('Helvetica').moveDown(2).text(analista, 2, 700, { align: 'center' })
                .text(datos.cargo, { align: 'center' })
                .image(qrBuffer, PAGE.width - 90, PAGE.height - 90, { width: 70 })
                .fontSize(7).text('Av. LOS LEONES. CENTRO EMPRESARIAL EL MOMOY, PLANTA ALTA, LOCAL # 10. BOCONÓ EDO. TRUJILLO. TLFS: 0272-6521256. BIO-DIAGNOSALUD@Hotmail.com', 2, 735, { align: 'center' });
            if (datos.nota) {
                doc.moveDown().font('Helvetica').text(`NOTA: ${datos.nota}`, 2, 690, { align: 'center' });
            }

        }
        function addPageWithNumber(pageNumber) {
            doc.fontSize(9).text(`Pág ${pageNumber}`, 30, 810);
        }
        addPageWithNumber(1);
        crearSeccion();

        let startX = 30;
        let startY = 178;
        let cellPadding = 5
        let maxHeight = 6;
        let examenes = 0;
        let index = 0;
        let pag = 1;
        resultado.respuesta.map(r => {
            index++
            let text;
            if (examenes !== r.id) {
                if (index > 15) {
                    pag++
                    doc.addPage();
                    crearSeccion();
                    addPageWithNumber(pag);
                    startY = 178;
                    index = 0
                }
                examenes = r.id;
                text = doc.font('Helvetica').fontSize(10).text(r.examen_nombre, startX + cellPadding, startY + cellPadding, { width: 534 - cellPadding * 2, align: 'center' }).height;
                if (text > maxHeight) { maxHeight = text; }
                doc.rect(startX, startY, 534, maxHeight + cellPadding * 2).stroke();
                startX += 534;
                startY += maxHeight + cellPadding * 2;
                startX = 30;

                text = doc.font('Helvetica-Bold').fontSize(10).text('ANÁLISIS', startX + cellPadding, startY + cellPadding, { width: 178 - cellPadding * 2, align: 'center' }).height;
                if (text > maxHeight) { maxHeight = text; }
                doc.rect(startX, startY, 178, maxHeight + cellPadding * 2).stroke();
                startX += 178;

                text = doc.font('Helvetica-Bold').fontSize(10).text('VALOR PACIENTE', startX + cellPadding, startY + cellPadding, { width: 178 - cellPadding * 2, align: 'center' }).height;
                if (text > maxHeight) { maxHeight = text; }
                doc.rect(startX, startY, 178, maxHeight + cellPadding * 2).stroke();
                startX += 178;

                text = doc.font('Helvetica-Bold').fontSize(10).text('VALORES REFERENCIALES', startX + cellPadding, startY + cellPadding, { width: 178 - cellPadding * 2, align: 'center' }).height;
                if (text > maxHeight) { maxHeight = text; }
                doc.rect(startX, startY, 178, maxHeight + cellPadding * 2).stroke();
                startX += 178;


                // Avanza a la siguiente fila
                startY += maxHeight + cellPadding * 2;
                startX = 30;

            }


            text = doc.font('Helvetica').fontSize(10).text(r.analisis_nombre, startX + cellPadding, startY + cellPadding, { width: 178 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 178, maxHeight + cellPadding * 2).stroke();
            startX += 178;

            text = doc.font('Helvetica').fontSize(10).text(r.valor, startX + cellPadding, startY + cellPadding, { width: 178 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 178, maxHeight + cellPadding * 2).stroke();
            startX += 178;

            text = doc.font('Helvetica').fontSize(10).text(r.referencia, startX + cellPadding, startY + cellPadding, { width: 178 - cellPadding * 2, align: 'left' }).height;
            if (text > maxHeight) { maxHeight = text; }
            doc.rect(startX, startY, 178, maxHeight + cellPadding * 2).stroke();
            startX += 178;

            // Avanza a la siguiente fila
            startY += maxHeight + cellPadding * 2;
            startX = 30;

        });




        doc.end();

    } catch (error) {
        console.log(error.message)
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Error generando PDF' });
    }
});

module.exports = router;