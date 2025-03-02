const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

function format_number(number) {
    return number.includes('.') ? number.replace(/\.?0+$/, '') : number;
}

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    try {
        const query = `
            SELECT f.id AS id, f.numero AS numero, f.fecha AS fecha, r.apellido AS apellido, r.nombre AS nombre, 
                   r.cedula AS cedula, tc.tipo AS tipo_cedula, p.valor AS Bolivar, f.numeo_paciente_dia AS numeroPaciente, 
                   pa.nombre AS pa_nombre, pa.apellido AS pa_apellido, pa.cedula AS pa_cedula, tcpa.tipo AS pa_tipo_cedula, 
                   r.telefono AS pa_telefono, f.total AS ftotal, pa.id AS id_paciente, 
                   e.nombre AS empleadoNombre, e.apellido AS empleadoApellido
            FROM factura f
            LEFT JOIN razon_social r ON f.razon_social = r.id
            LEFT JOIN tipo_cedula tc ON r.tipo_cedula = tc.id
            LEFT JOIN parametros p ON p.nombre = 'Bolivar'
            LEFT JOIN paciente pa ON f.paciente = pa.id
            LEFT JOIN tipo_cedula tcpa ON pa.tipo_cedula = tcpa.id
            LEFT JOIN empleado e ON f.id_empleado = e.id
        `;
        
        const resultados = await conexion(query);

        if (resultados.estatus !== 'éxito') {
            throw new Error('Error en la consulta de datos');
        }

        const facturaFinal = resultados.respuesta.map(row => {
            const numero = row.numero !== 'none' ? String(row.numero).padStart(7, '0') : row.numero;
                      return {
                razonSocialNombre: `${row.nombre} ${row.apellido}`,
                razonSocialTipoCedula: row.tipo_cedula,
                razonSocialCedula: row.cedula,
                nombrePaciente: `${row.pa_nombre} ${row.pa_apellido}`,
                tipoCedulaPaciente: row.pa_tipo_cedula,
                cedulaPaciente: row.pa_cedula,
                fecha: row.fecha,
                factura: numero,
                idFactura: row.id,
                analista: `${row.empleadoNombre} ${row.empleadoApellido}`,
                totalFacturaBs: format_number(( parseFloat(row.ftotal) * parseFloat(row.Bolivar)).toFixed(2))
                
                
            };
        });

        res.json({estatus:resultados.estatus, respuesta:facturaFinal});
    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
