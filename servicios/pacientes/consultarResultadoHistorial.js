const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

function calcularEdad(fechaNacimiento) {
  const fechaNac = new Date(fechaNacimiento);
  const fechaActual = new Date();
  const diferencia = new Date(fechaActual - fechaNac);
  return Math.abs(diferencia.getUTCFullYear() - 1970);
}

router.post('/', async (req, res) => {

  try {
    const { examen_id } = req.body;

    if (!req.session.usuario) {
      return res.status(400).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    if (!examen_id) {
      return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
    }
    const sql = `SELECT pe.id AS paciente_examen_id, 
                pe.paciente, 
                pe.fecha AS fecha, 
                pe.paciente_dia AS paciente_dia, 
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
                s.nombre AS servicio_nombre, 
                c.nombre AS convenio_nombre, 
                ca.nombre AS cargo, 
                em.nombre AS analista_nombre, 
                em.apellido AS analista_apellido, 
                f.numero AS numero, 
                pe.precio AS precio, 
                a.nombre AS nombreAnalisis 
              FROM paciente_examen pe 
              LEFT JOIN examen_paciente_historial eph ON pe.id = eph.examen 
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
              LEFT JOIN analisis a ON eph.analisis = a.id 
              WHERE eph.id_historial IN ( 
                SELECT id_historial 
                FROM examen_paciente_historial 
                WHERE examen = ? 
              )`;

    const result = await conexion(sql, [examen_id]);

    if (result.estatus !== 'éxito') {
      throw new Error('Error al obtener el historial');
    }

    const resultData = result.respuesta;

    if (resultData.length === 0) {
      return res.status(200).json({ estatus: 'error', respuesta: 'no se encontraron resultados' });
    }

    // Agrupar exámenes y análisis
    const examenesMap = {};
    resultData.forEach(dato => {
      const examenId = dato.paciente_examen_id;

      if (!examenesMap[examenId]) {
        examenesMap[examenId] = {
          id_examen: examenId,
          nombre_examen: dato.examen_nombre,
          analisis: []
        };
      }

      if (dato.nombreAnalisis) {
        examenesMap[examenId].analisis.push({
          nombre: dato.nombreAnalisis,
          valor: dato.valor,
          referencia: dato.referencia
        });
      }
    });

    // Datos generales
    const primerRegistro = resultData[0];
    const factura = primerRegistro.precio === 0
      ? 'exonerado'
      : primerRegistro.numero === null
        ? 'N/A'
        : primerRegistro.numero;

    const datos = {
      numero: String(primerRegistro.paciente_dia).padStart(2, '0'),
      nombre: `${primerRegistro.paciente_nombre} ${primerRegistro.apellido}`,
      sexo: primerRegistro.sexo_valor,
      cedula: `${primerRegistro.tipo_cedula_tipo}${primerRegistro.cedula}`,
      remitida: primerRegistro.convenio_nombre,
      servicio: primerRegistro.servicio_nombre,
      nota: primerRegistro.nota,
      analista: `${primerRegistro.analista_nombre} ${primerRegistro.analista_apellido}`,
      cargo: primerRegistro.cargo,
      fecha: new Date(primerRegistro.fecha).toLocaleDateString('es-VE'),
      edad: calcularEdad(primerRegistro.fecha_nacimiento),
      examenes: Object.values(examenesMap),
      factura: factura
    };

    return res.status(200).json({ estatus: 'éxito', respuesta: datos });

  } catch (error) {
    reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
    return res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
  }
});

module.exports = router;