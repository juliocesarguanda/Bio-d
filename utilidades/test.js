const os = require('os');
const { promisify } = require('util');
const ping = require('ping');

async function scanLocalNetwork() {
  // Obtener interfaces de red
  const interfaces = os.networkInterfaces();
  
  // Encontrar la primera interfaz IPv4 no interna
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

  // Escanear todas las IPs en el rango 1-254
  const activeIPs = [];
  const promises = [];
  
  for (let i = 1; i <= 254; i++) {
    const ip = targetSubnet + i;
    promises.push(ping.promise.probe(ip, {
      timeout: 1, // Tiempo de espera en segundos
      extra: process.platform === 'win32' ? ['-n', '1'] : ['-c', '1'] // Argumentos específicos del SO
    }));
  }

  const results = await Promise.all(promises);
  
  results.forEach(result => {
    if (result.alive) {
      activeIPs.push(result.host);
    }
  });

  return activeIPs;
}

// Ejecutar el escaneo
scanLocalNetwork()
  .then(activeIPs => {
    console.log('Dispositivos conectados:');
    activeIPs.forEach(ip => console.log(`- ${ip}`));
  })
  .catch(err => console.error('Error:', err));