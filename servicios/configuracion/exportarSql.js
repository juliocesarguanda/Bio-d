const express = require('express');
const router = express.Router();
const { conexion, connector } = require('../../utilidades/conexion.js');
const { reportError } = require('../../utilidades/reporte.js');

router.post('/', async (req, res) => {
    try {
        // Verificar permisos
        if (!req.session.usuario || req.session.usuario.tipo != '1') {
            return res.status(403).json({ estatus: 'error', respuesta: 'Acceso no autorizado' });
        }

        const databaseName = connector.config.database;

        let sqlContent = `-- Backup generado por servidor: ${connector.getCurrentHost()}\n`;
        sqlContent += `-- Base de datos: ${databaseName}\n`;
        sqlContent += `-- Fecha de creación: ${new Date().toLocaleString()}\n\n`;
        sqlContent += `SET FOREIGN_KEY_CHECKS=0;\n\n`;

        // Consultar las tablas existentes
        const { respuesta: tablas } = await conexion('SHOW TABLES');
        const nombreTablas = tablas.map(t => t[`Tables_in_${databaseName}`]);

        for (const tabla of nombreTablas) {
            // Estructura de la tabla
            const { respuesta: estructura } = await conexion(`SHOW CREATE TABLE \`${tabla}\``);
            sqlContent += `-- --------------------------------------------------------\n`;
            sqlContent += `-- Estructura para la tabla \`${tabla}\`\n`;
            sqlContent += `${estructura[0]['Create Table']};\n\n`;

            // Datos de la tabla
            const { respuesta: datos } = await conexion(`SELECT * FROM \`${tabla}\``);
            if (datos.length > 0) {
                sqlContent += `-- Volcado de datos para la tabla \`${tabla}\`\n`;
                const columnas = Object.keys(datos[0]).map(col => `\`${col}\``).join(', '); // Nombres de columnas

                sqlContent += `INSERT INTO \`${tabla}\` (${columnas}) VALUES\n`;

                const valoresInsert = datos.map(row => {
                    const valores = Object.values(row).map(v => {
                        if (typeof v === 'string') {
                            return `'${v.replace(/'/g, "\\'")}'`; // Escapar comillas simples
                        }
                        if (v instanceof Date) {
                            return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`; // Formato de fecha MySQL
                        }
                        return v === null ? 'NULL' : v; // Valores nulos o numéricos
                    });
                    return `(${valores.join(', ')})`;
                });

                sqlContent += `${valoresInsert.join(',\n')};\n\n`; // Unir todos los valores
            }
        }

        sqlContent += `SET FOREIGN_KEY_CHECKS=1;\n`;
        sqlContent += `-- Fin del backup\n`;

        return res.status(200).json({
            estatus: 'exito',
            respuesta: sqlContent
        });

    } catch (error) {
        console.error('Error al generar el backup:', error);
        reportError(__filename, new Date(), error.message, req.originalUrl, req.body);
        return res.status(500).json({
            estatus: 'error',
            respuesta: 'Error al generar el backup: ' + error.message
        });
    }
});

module.exports = router;
