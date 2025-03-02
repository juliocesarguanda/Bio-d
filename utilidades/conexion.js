const os = require('os');
const ping = require('ping');
const mysql = require('mysql2/promise');

class MySQLConnector {
  constructor() {
    this.config = {
      user: 'root',
      password: '',
      database: 'bio_diagno_salud',
      connectTimeout: 5000,
      port: 3306,
      ssl: false // Deshabilitamos SSL
    };
    this.connection = null;
    this.currentHost = null;
  }

  async scanLocalNetwork() {
    const interfaces = os.networkInterfaces();
    let targetSubnet;

    Object.keys(interfaces).some(iface => {
      return interfaces[iface].some(details => {
        if (details.family === 'IPv4' && !details.internal) {
          const ipParts = details.address.split('.');
          targetSubnet = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.`;
          return true;
        }
      });
    });

    if (!targetSubnet) {
      throw new Error('No se pudo detectar la red local');
    }

    const activeIPs = [];
    const promises = [];

    for (let i = 1; i <= 254; i++) {
      const ip = targetSubnet + i;
      promises.push(ping.promise.probe(ip, {
        timeout: 1,
        extra: process.platform === 'win32' ? ['-n', '1'] : ['-c', '1']
      }));
    }

    const results = await Promise.all(promises);
    results.forEach(result => result.alive && activeIPs.push(result.host));
    return activeIPs;
  }

  async createUserIfNotExists() {
    try {
      console.log('Verificando usuario root en localhost...');
      const tempConnection = await mysql.createConnection({ ...this.config, host: '127.0.0.1' });

      const [rows] = await tempConnection.query(`
        SELECT COUNT(*) AS user_exists 
        FROM mysql.user 
        WHERE user = 'root' 
        AND host = '%'
      `);

      if (rows[0].user_exists === 0) {
        console.log('Creando usuario root con acceso remoto...');
        await tempConnection.query(`
          CREATE USER 'root'@'%' IDENTIFIED BY '';
        `);
        await tempConnection.query(`
          GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
        `);
        await tempConnection.query(`
          FLUSH PRIVILEGES;
        `);
        console.log('Usuario root creado y permisos otorgados.');
      } else {
        console.log('Usuario root ya existe con acceso remoto.');
      }

      await tempConnection.end();
    } catch (error) {
      console.error('Error creando usuario root con acceso remoto:', error.message);
    } 
  }

  async connect() {
    await this.createUserIfNotExists(); // Verificar y crear usuario antes de intentar conexión

    if (this.connection) return;

    const tryHosts = ['127.0.0.1'];
    if (this.currentHost) tryHosts.unshift(this.currentHost);

    for (const host of tryHosts) {
      console.log(`\n[${new Date().toLocaleTimeString()}] Intentando conexión a: ${host}`);
      try {
        this.connection = await mysql.createConnection({ ...this.config, host });
        await this.connection.ping();
        console.log(`✔ Conexión exitosa con ${host}`);
        this.currentHost = host;
        return;
      } catch (error) {
        console.log(`✖ Falló conexión con ${host}: ${error.message}`);
        this.connection = null;
      }
    }

    let activeIPs;
    try {
      console.log('\nIniciando escaneo de red...');
      activeIPs = await this.scanLocalNetwork();
      console.log('IPs activas encontradas:', activeIPs);
    } catch (error) {
      throw new Error('Error en escaneo de red: ' + error.message);
    }

    for (const ip of activeIPs) {
      console.log(`\n[${new Date().toLocaleTimeString()}] Intentando conexión a: ${ip}`);
      try {
        this.connection = await mysql.createConnection({ ...this.config, host: ip });
        await this.connection.ping();
        console.log(`✔ Conexión exitosa con ${ip}`);
        this.currentHost = ip;
        return;
      } catch (error) {
        console.log(`✖ Falló conexión con ${ip}: ${error.message}`);
        this.connection = null;
      }
    }

    throw new Error('No se pudo conectar a ningún servidor MySQL');
  }

  async query(sql, params = []) {
    try {
      if (!this.connection) await this.connect();

      const [result] = await this.connection.query(sql, params);
      return { estatus: 'éxito', respuesta: result };
    } catch (error) {
      console.error(`Error en query: ${error.message}`);
      await this.handleError();
      throw error;
    }
  }

  async handleError() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      this.currentHost = null;
      console.log('\nReiniciando conexión...');
    }
  }

  getCurrentHost() {
    return this.currentHost;
  }
}

// Uso
const connector = new MySQLConnector();

async function conexion(sql, params = []) {
  try {
    return await connector.query(sql, params);
  } catch (error) {
    return {
      estatus: 'error',
      respuesta: error.message,
      ultimaIP: connector.getCurrentHost()
    };
  }
}

module.exports = { conexion, connector };
