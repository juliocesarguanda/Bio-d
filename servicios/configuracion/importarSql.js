const express = require('express');
const router = express.Router();
const { conexion } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    try {
        // Verificar si hay un usuario en la sesión
        if (!req.session.usuario || req.session.usuario.tipo != '1') {
            return res.status(403).json({ estatus: 'error', respuesta: 'Acceso no autorizado' });
        }

        const { sql } = req.body;

        if (!sql || sql.trim() === '') {
            return res.status(400).json({ estatus: 'error', respuesta: 'Archivo SQL vacío o no válido' });
        }

        try {
            // Obtener las tablas existentes
            const { respuesta: tablas } = await conexion('SHOW TABLES');
            const nombreTablas = tablas.map(t => Object.values(t)[0]); // Lista de nombres de tablas

            // Desactivar las restricciones de claves foráneas
            await conexion('SET FOREIGN_KEY_CHECKS=0');

            // Eliminar todas las tablas existentes
            for (const tabla of nombreTablas) {
                await conexion(`DROP TABLE IF EXISTS \`${tabla}\``);
            }

            // Reactivar las restricciones de claves foráneas
            await conexion('SET FOREIGN_KEY_CHECKS=1');

            // Dividir y ejecutar las consultas SQL recibidas
            const queries = sql.split(';').filter(query => query.trim() !== '');
            for (let query of queries) {
                // Asegúrate de registrar consultas para rastreo en caso de errores
                console.log('Ejecutando:', query);
                await conexion(query);
            }

            res.status(200).json({ estatus: 'exito', respuesta: 'Base de datos importada correctamente' });
        } catch (error) {
            console.error('Error ejecutando SQL:', error);
            reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
            res.status(500).json({ estatus: 'error', respuesta: 'Error al procesar el archivo SQL: ' + error.message });
        }

    } catch (error) {
        console.error('Error general:', error);
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        res.status(500).json({ estatus: 'error', respuesta: 'Error inesperado: ' + error.message });
    }
});

module.exports = router;
