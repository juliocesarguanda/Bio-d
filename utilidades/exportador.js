// utilidades/exportador.js
const { conexion, connector } = require('./conexion');

const fs = require('fs-extra');
const path = require('path');

class ExportadorBD {
  constructor() {
    this.rutaBackups = path.join(__dirname, '..', 'backups');
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.rutaBackups)) {
      fs.mkdirSync(this.rutaBackups, { recursive: true });
    }
  } 

  async generarDumpSQL() {
    let sqlContent = '';
    try {
      // Encabezado del dump
      sqlContent += `-- MySQL Dump generado por BioDiagnoSalud\n`;
      sqlContent += `-- Fecha: ${new Date().toLocaleString()}\n`;
      sqlContent += `-- Servidor: ${connector.getCurrentHost()}\n`;
      sqlContent += `-- Base de datos: ${connector.config.database}\n\n`;
      sqlContent += `/*!40030 SET NAMES UTF8 */;\n`;
      sqlContent += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

      // Obtener listado de tablas
      const { respuesta: tablas } = await conexion('SHOW TABLES');
      const nombreTablas = tablas.map(t => t[`Tables_in_${connector.config.database}`]);

      // Generar contenido para cada tabla
      for (const tabla of nombreTablas) {
        sqlContent += await this.generarEstructuraTabla(tabla);
        sqlContent += await this.generarDatosTabla(tabla);
      }

      // Finalizar el dump
      sqlContent += `SET FOREIGN_KEY_CHECKS = 1;\n`;
      sqlContent += `-- Fin del volcado de datos\n`;

      return {
        estatus: 'éxito',
        contenido: sqlContent,
        ruta: await this.guardarArchivo(sqlContent),
        tamaño: Buffer.byteLength(sqlContent, 'utf8')
      };

    } catch (error) {
      return {
        estatus: 'error',
        error: error.message,
        servidor: connector.getCurrentHost()
      };
    }
  }

  async generarEstructuraTabla(tabla) {
    const { respuesta: estructura } = await conexion(`SHOW CREATE TABLE \`${tabla}\``);
    return `-- --------------------------------------------------------\n
-- Estructura de tabla para '${tabla}'\n
DROP TABLE IF EXISTS \`${tabla}\`;\n
${estructura[0]['Create Table']};\n\n`;
  }

  async generarDatosTabla(tabla) {
    let sqlDatos = '';
    const { respuesta: datos } = await conexion(`SELECT * FROM \`${tabla}\``);
    
    if (datos.length > 0) {
      sqlDatos += `-- Volcado de datos para tabla '${tabla}'\n`;
      sqlDatos += `LOCK TABLES \`${tabla}\` WRITE;\n`;
      sqlDatos += `/*!40000 ALTER TABLE \`${tabla}\` DISABLE KEYS */;\n`;

      datos.forEach(row => {
        const valores = Object.values(row).map(v => 
          typeof v === 'string' ? connector.connection.escape(v) : 
          v === null ? 'NULL' : v
        );
        sqlDatos += `INSERT INTO \`${tabla}\` VALUES (${valores.join(', ')});\n`;
      });

      sqlDatos += `/*!40000 ALTER TABLE \`${tabla}\` ENABLE KEYS */;\n`;
      sqlDatos += `UNLOCK TABLES;\n\n`;
    }
    
    return sqlDatos;
  }

  async guardarArchivo(contenido) {
    const nombreArchivo = `backup_${connector.config.database}_${Date.now()}.sql`;
    const rutaCompleta = path.join(this.rutaBackups, nombreArchivo);
    
    await fs.promises.writeFile(rutaCompleta, contenido, 'utf8');
    return rutaCompleta;
  }
}

module.exports = new ExportadorBD();