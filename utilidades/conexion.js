const os = require('os');
const net = require('net');
const mysql = require('mysql2/promise');

class MySQLConnector {
  constructor() {
    this.config = {
      user: 'root',
      password: '',
      database: 'bio_diagno_salud',
      connectTimeout: 5000,
      port: 3306,
      ssl: false,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
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

    if (!targetSubnet) throw new Error('No se pudo detectar la red local');

    const ips = Array.from({length: 254}, (_, i) => targetSubnet + (i + 1));
    const activeIPs = [];
    const concurrency = 200; // Conexiones paralelas
    const timeout = 200; // 200ms por IP

    const checkMySQLPort = (ip) => new Promise((resolve) => {
      const socket = new net.Socket();
      let resolved = false;

      socket.on('connect', () => {
        resolved = true;
        socket.destroy();
        resolve(ip);
      });

      socket.on('error', () => {
        if (!resolved) {
          socket.destroy();
          resolve(null);
        }
      });

      socket.setTimeout(timeout);
      socket.on('timeout', () => {
        if (!resolved) {
          socket.destroy();
          resolve(null);
        }
      });

      socket.connect(3306, ip);
    });

    // Escaneo en bloques paralelos
    while (ips.length) {
      const chunk = ips.splice(0, concurrency);
      const results = await Promise.all(chunk.map(checkMySQLPort));
      results.forEach(ip => ip && activeIPs.push(ip));
      if (activeIPs.length > 0) break; // Cortocircuito si encuentra IPs activas
    }

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
        await tempConnection.query(`CREATE USER 'root'@'%' IDENTIFIED BY ''`);
        await tempConnection.query(`GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION`);
        await tempConnection.query(`FLUSH PRIVILEGES`);
        console.log('Usuario root creado y permisos otorgados.');
      }
      
      await tempConnection.end();
    } catch (error) {
      console.error('Error en configuración de usuario:', error.message);
    }
  }

  async connect() {
    await this.createUserIfNotExists();

    if (this.connection) return;

    // Intentar conexiones rápidas primero
    const fastHosts = ['127.0.0.1', 'localhost', this.currentHost].filter(Boolean);
    for (const host of fastHosts) {
      try {
        console.log(`\n[${new Date().toLocaleTimeString()}] Intentando conexión rápida a: ${host}`);
        this.connection = await mysql.createConnection({ ...this.config, host });
        await this.connection.ping();
        console.log(`✔ Conexión exitosa con ${host}`);
        this.currentHost = host;
        return;
      } catch (error) {
        console.log(`✖ Falló conexión rápida con ${host}: ${error.message}`);
        this.connection = null;
      }
    }

    // Escaneo optimizado
    console.log('\nIniciando escaneo de red acelerado...');
    let activeIPs;
    try {
      activeIPs = await this.scanLocalNetwork();
      console.log('IPs activas encontradas:', activeIPs);
    } catch (error) {
      throw new Error('Error en escaneo de red: ' + error.message);
    }

    // Intentar conexiones en paralelo
    const connectionAttempts = activeIPs.map(ip => 
      mysql.createConnection({ ...this.config, host: ip })
        .then(conn => {
          console.log(`✔ Conexión exitosa con ${ip}`);
          return conn;
        })
        .catch(error => {
          console.log(`✖ Falló conexión con ${ip}: ${error.message}`);
          return null;
        })
    );

    const connections = await Promise.all(connectionAttempts);
    const validConnection = connections.find(conn => conn !== null);

    if (validConnection) {
      this.connection = validConnection;
      this.currentHost = validConnection.config.host;
      return;
    }

    throw new Error('No se pudo conectar a ningún servidor MySQL');
  }

  // Resto de métodos se mantienen igual
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