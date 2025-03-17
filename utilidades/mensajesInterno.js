
const { port } = require('../main.js');
const os = require('os');
const axios = require('axios');

class NetworkScanner {
  // Detectar red local
  static getLocalNetwork() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
      for (const details of iface) {
        if (details.family === 'IPv4' && !details.internal) {
          const [a, b, c] = details.address.split('.');
          return { localIP: details.address, subnet: `${a}.${b}.${c}.` };
        }
      }
    }
    throw new Error('Red no detectada');
  }

  // Disparar solicitudes directamente con alta concurrencia y timeout mínimo
  static async sendRequestsToAll(subnet, port, ruta, datos) {
    const allIPs = Array.from({ length: 254 }, (_, i) => `${subnet}${i + 1}`);

    // Configuración de Axios para solicitudes rápidas
    const axiosInstance = axios.create({
      timeout: 1500, // Máximo 100ms por intento
      httpAgent: new (require('http').Agent)({ keepAlive: true }),
      httpsAgent: new (require('https').Agent)({ keepAlive: true }),
    });

    const promises = allIPs.map((ip) => {
      const url = `http://${ip}:${port}${ruta}`;
      return axiosInstance
        .post(url, datos)
        .then(() => ip) // Registrar IP activa si responde
        .catch(() => null); // Ignorar fallos
    });

    return await Promise.all(promises); // Procesar todo en paralelo
  }
}

// Función principal
async function scanAndSendRequests(ruta, datos) {
  try {
    const { subnet, localIP } = NetworkScanner.getLocalNetwork();

    // Escanear y enviar en paralelo
    const responses = await NetworkScanner.sendRequestsToAll(subnet, port, ruta, datos);

    // Filtrar las IPs activas
    const activeIPs = responses.filter((ip) => ip !== null);

    // Incluir la IP local (si es necesario)
    if (!activeIPs.includes(localIP)) {
      activeIPs.push(localIP);
    }

    return { status: 'completed', targets: activeIPs.length };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

// Exportar función para uso externo
module.exports = {
  scanAndSendRequests,
};
