const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');
const moment = require('moment');

router.post('/', async (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ estatus: 'error', respuesta: 'Usuario no autenticado' });
    }
    const { idPaciente, remitida, resultadoPacientes, servicio, note = '', resultadoPacientesAlert } = req.body;

    if (!idPaciente || !remitida || !resultadoPacientes || !servicio) {
        return res.status(400).json({ estatus: 'error', respuesta: 'Faltan datos requeridos' });
    }

    try {
        // Obtener el id del empleado analista
        const sqlAnalista = `
            SELECT valor 
            FROM parametros 
            WHERE nombre =  'analista' 
        `;
        const resultAnalista = await conexion(sqlAnalista, []);

        if (resultAnalista.estatus !== 'éxito') {
            throw new Error('Error al obtener analista');
        }

        const id_empleado = resultAnalista.respuesta[0].valor;
        const fecha = moment().format('YYYY-MM-DD');

        // Obtener paciente_examen
        const sqlPacienteExamen = `
            SELECT a.id AS idExamenPaciente, a.valor AS valorExamen, pe.examen AS idExamen, pe.id AS id 
            FROM paciente_examen pe 
            LEFT JOIN examen_analisis ea ON pe.examen = ea.id_examen 
            LEFT JOIN analisis a ON ea.id_analisis = a.id 
            WHERE pe.paciente = ? AND pe.estatus = 1
        `;
        const resultPacienteExamen = await conexion(sqlPacienteExamen, [idPaciente]);

        if (resultPacienteExamen.estatus !== 'éxito') {
            throw new Error('Error al obtener exámenes del paciente');
        }



        // Insertar en historial_paciente
        const sqlHistorialPaciente = `
            INSERT INTO historial_paciente (fecha, id_empleado, remitida, servicio, nota) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const resultHistorialPaciente = await conexion(sqlHistorialPaciente, [
            fecha,
            id_empleado,
            remitida,
            servicio,
            note
        ]);

        if (resultHistorialPaciente.estatus !== 'éxito') {
            throw new Error('Error al crear historial');
        }

        const id_historial = resultHistorialPaciente.respuesta.insertId;

        // Procesar resultados
        const examen_paciente_historial = [];
        const examenesUpdate = [];
        const analisisUpdate = [];

        // (id_historial, examen, valor, alerta, referencia, analisis) 
        resultadoPacientes.forEach(item1 => {
            resultadoPacientesAlert.forEach(item2 => {
                if ((item1.nombre.split(" ")[0] == item2.nombre.split(" ")[0]) &&
                    (item1.nombre.split(" ")[1] == item2.nombre.split(" ")[1])) {
                    alerta = item2.valor;

                }
            });
            resultPacienteExamen.respuesta.forEach(item3 => {
                if (item3.idExamenPaciente == item1.nombre.split(" ")[1]) {
                    valor = item3.valorExamen;
                }
            });

            examen_paciente_historial.push([
                id_historial,
                item1.nombre.split(" ")[0],
                item1.valor,
                alerta,
                valor,
                item1.nombre.split(" ")[1]
            ]);
            examenesUpdate.push(item1.nombre.split(" ")[0]);

            analisisUpdate.push(item1.nombre.split(" ")[1]);
        });
        // Insertar en examen_paciente_historial
        const sqlExamenPacienteHistorial = `
            INSERT INTO examen_paciente_historial 
            (id_historial, examen, valor, alerta, referencia, analisis) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        for (const row of examen_paciente_historial) {
            const result = await conexion(sqlExamenPacienteHistorial, row);
            if (result.estatus !== 'éxito') {
                throw new Error('Error al insertar resultado');
            }
        }

        // Actualizar paciente_examen
        const sqlUpdatePacienteExamen = `
            UPDATE paciente_examen 
            SET estatus = 2 
            WHERE id = ?
        `;

        for (const id of examenesUpdate) {
            const result = await conexion(sqlUpdatePacienteExamen, [id]);
            if (result.estatus !== 'éxito') {
                throw new Error('Error al actualizar examen');
            }
        }

        // Verificar abonado
        const sqlVerificaAbonado = `
            SELECT paciente 
            FROM paciente_examen 
            WHERE abonado < precio and paciente = ?
        `;
        const resultVerificaAbonado = await conexion(sqlVerificaAbonado, [idPaciente]);

        if (resultVerificaAbonado.estatus !== 'éxito') {
            throw new Error('Error al verificar pagos');
        }

        let resultado = 'listo';
        if(resultVerificaAbonado.respuesta.length > 0){
            resultado = 'falta';
        }
        // Actualizar reactivos
        // Paso 1: Contar ocurrencias de cada análisis
        const conteoAnalisis = {};
        analisisUpdate.forEach(id => {
            conteoAnalisis[id] = (conteoAnalisis[id] || 0) + 1;
        });

        // Paso 2: Obtener todos los IDs (incluyendo duplicados)
        const ids = analisisUpdate.join(',');

        const sqlReactivo = `
            SELECT re.id AS reactivoID, 
                re.cantidad AS reactivoCantidad,
                a.id AS analisisID, 
                mis.miscelaneo AS miscelaneo
            FROM analisis a 
            LEFT JOIN miscelaneo_analisis mis ON a.id
            LEFT JOIN reactivo re ON a.reactivo = re.id  
            WHERE a.id IN (${ids})
        `;

        const resultReactivo = await conexion(sqlReactivo, []);
        if (resultReactivo.estatus !== 'éxito') {
            throw new Error('Error al obtener reactivos');
        }

        const datosReactivo = resultReactivo.respuesta.map(row => ({
            id: row.reactivoID
        }));
        const datosmiscelaneo = resultReactivo.respuesta.map(row => ({
            id: row.miscelaneo
        }));

        // Paso 6: Actualizar reactivos
        const sqlUpdateReactivo = `
            UPDATE reactivo SET cant = cant - cantidad, disponible = disponible - 1 WHERE id = ?
            
        `;
        const sqlUpdatemiscelaneo = `
            UPDATE miscelaneo 
            SET cantidad = cantidad - 1 
            WHERE id = ?
        `;

        for (row of datosReactivo) {
            const result = await conexion(sqlUpdateReactivo, [ row.id]);
            if (result.estatus !== 'éxito') {
                throw new Error('Error al actualizar reactivo');
            }
        }
        for (row of datosmiscelaneo) {
            result = await conexion(sqlUpdatemiscelaneo, [row.cantidad, row.id]);
            if (result.estatus !== 'éxito') {
                throw new Error('Error al actualizar miscelaneo');
            }
        }

        res.json({ estatus: resultado });

    } catch (error) {
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Ups. Algo ocurrió' });
    }
});

module.exports = router;
