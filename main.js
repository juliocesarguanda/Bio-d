const { app, BrowserWindow, ipcMain, globalShortcut, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const { exec } = require('child_process');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs-extra');
const { Server } = require('socket.io');
const http = require('http');

const serverApp = express();
const port = 3007;
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204
};
const faviconPath = path.join(__dirname, 'dev/assets/img/icon.ico');
const server = http.createServer(serverApp);
const io = new Server(server, {
  cors: {
    origin: '*' // Ajusta esto en producción
  }
});

function sendMessage(message) {
  io.emit('message', message);
}

// autoUpdater.on('update-available', () => {
//   console.log('Actualización disponible.');
// });

// autoUpdater.on('update-not-available', () => {
//   console.log('No hay actualizaciones disponibles.');
// });

// autoUpdater.on('error', (error) => {
//   console.error('Error en autoUpdater:', error.message);
// });

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Actualización lista',
    message: 'Se descargó una actualización. ¿Reiniciar ahora? Recuerda que se reiniciará la aplicación.',
    buttons: ['Reiniciar', 'Posponer']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});


// Función para configurar y crear el servidor Express
function createServer() {

  serverApp.use('/favicon.ico', (req, res) => {
    res.sendFile(faviconPath);
  });
  serverApp.use((req, res, next) => {
    if (req.path.includes('/socket.io')) return next();
    express.json()(req, res, next);
  });
  serverApp.use('/dev', express.static(path.join(__dirname, 'dev')));
  serverApp.use(cors(corsOptions));
  serverApp.use(express.json());
  serverApp.use(express.urlencoded({ extended: false }));
  serverApp.use(
    session({
      secret: 'secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 2 * 24 * 60 * 60 * 1000 // 2 días
      }
    })
  );

  // Función para cargar rutas dinámicamente
  const cargarRutas = (carpeta, basePath = '') => {
    fs.readdirSync(carpeta).forEach((archivo) => {
      const fullPath = path.join(carpeta, archivo);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        // Cargar directorios recursivamente
        cargarRutas(fullPath, `${basePath}/${archivo}`);
      } else if (stats.isFile() && path.extname(fullPath) === '.js') {
        const ruta = require(fullPath);
        const rutaCargada = `${basePath}/${path.basename(fullPath, '.js')}`;
        serverApp.use(rutaCargada, ruta);
      }
    });
  };

  // Cargar las rutas desde la carpeta 'servicios'
  cargarRutas(path.join(__dirname, 'servicios'));

  // Ruta de health-check
  serverApp.get('/health-check', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Función para liberar el puerto
  const liberarPuerto = (port, callback) => {
    const comando =
      process.platform === 'win32'
        ? `netstat -ano | findstr :${port}` // Comando para Windows
        : `lsof -t -i:${port}`; // Comando para Linux/Unix

    exec(comando, (err, stdout, stderr) => {
      if (err || stderr) {
        return callback(err || new Error(stderr));
      }

      const pids = stdout
        .trim()
        .split('\n')
        .filter(Boolean); // Obtener todos los PIDs en uso por el puerto

      if (pids.length === 0) {
        return callback(); // No hay procesos usando el puerto
      }

      // Liberar todos los PIDs encontrados
      const comandoMatar =
        process.platform === 'win32'
          ? `taskkill /PID ${pids.join(' /PID ')} /F` // Liberar para Windows
          : `kill -9 ${pids.join(' ')}`; // Liberar para Linux/Unix

      exec(comandoMatar, (err, stdout, stderr) => {
        if (err || stderr) {
          return callback(err || new Error(stderr));
        }

        console.log(`Procesos liberados en el puerto ${port}: ${pids.join(', ')}`);
        callback();
      });
    });
  };

  // Iniciar el servidor y devolver una promesa
  return new Promise((resolve, reject) => {
    server
      .listen(port, () => {
        console.log(`Servidor corriendo en el puerto ${port}`);
        resolve();
      })
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`El puerto ${port} está ocupado. Intentando liberar el puerto...`);
          liberarPuerto(port, (error) => {
            if (error) {
              console.error(`No se pudo liberar el puerto ${port}:`, error);
              process.exit(1);
            } else {
              console.log(`Puerto ${port} liberado. Intentando iniciar el servidor de nuevo...`);
              createServer().then(resolve).catch(reject); // Intentar iniciar de nuevo
            }
          });
        } else {
          console.error('Error al iniciar el servidor:', err);
          reject(err);
        }
      });
  });
}
// Función para crear la ventana de Electron
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true,
      devTools: false, // Desactivar herramientas de desarrollo en producción
      sandbox: false,
      enableRemoteModule: false, // Deshabilita remote module si no es necesario
      contentSecurityPolicy: `
            default-src 'self';
            script-src 'self' 'unsafe-eval';
            style-src 'self' 'unsafe-inline';
            img-src 'self' data:;
            font-src 'self';
            connect-src 'self';
            form-action 'self';
            frame-ancestors 'none';
        `
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'dev/assets/img/png/', 'logo.png')
  });
  win.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    const hash = parsedUrl.hash;

    // Si el enlace contiene un hash (ej: #hola)
    if (hash) {
      event.preventDefault(); // Evita la recarga

      // Envía el hash al proceso de renderizado (ventana)
      win.webContents.send('scroll-to-hash', hash);
    }
  });

  win.webContents.on('new-window', (event, url, frameName, disposition, options) => {
    event.preventDefault();

    // Configurar nuevas ventanas
    Object.assign(options, {
      frame: false,
      icon: path.join(__dirname, 'dev/assets/img/png/', 'logo.png'),
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    const newWindow = new BrowserWindow(options);
    event.newGuest = newWindow;
    newWindow.loadURL(url);
  });









  win.loadURL(`http://localhost:${port}/dev/index.html`);
  Menu.setApplicationMenu(null);
  win.maximize();
  win.webContents.on('did-finish-load', () => {
    // HTML de la barra de título personalizada
    const titleBarHtml = `
  <div class="title-bar">
  <div class="title-bar-2">
    <button id="minimize">-</button>
    <button id="maximize">□</button>
    <button id="close">X</button>  
    <div class="zoom-controls">
      <button id="zoom-out">-</button>
      <span id="zoom-level">100%</span>
      <button id="zoom-in">+</button>
    </div>
  </div>    
  </div>
  <div id="modal-overlay" class="modal-overlay">
          <div class="modal-content3">
              <h2>Confirmar Salida</h2>
              <p>¿Está seguro que desea salir del sistema?</p>
              <div class="modal-actions">
                  <button id="confirm-exit" class="btn3 btn-exit3">Salir</button>
                  <button id="cancel-exit" class="btn3 btn-cancel3">Cancelar</button>
              </div>
          </div>
  </div>
  <div id="update-notification" style="display: none; position: fixed; top: 10px; right: 10px; padding: 15px; background: #4CAF50; color: white; border-radius: 5px;">
<span id="update-message"></span>
</div>
`;
    win.webContents.executeJavaScript(`
      const titleBarDiv = document.createElement('div');
      titleBarDiv.innerHTML = \`${titleBarHtml}\`;
      document.body.prepend(titleBarDiv);

      const { ipcRenderer } = require('electron');
            document.getElementById('minimize').addEventListener('click', () => {
        ipcRenderer.send('minimize-window');
      });
      document.getElementById('maximize').addEventListener('click', () => {
        ipcRenderer.send('maximize-window');
      });

      document.getElementById('close').addEventListener('click', () => {
        document.getElementById('modal-overlay').classList.add('show');
      });
      document.getElementById('cancel-exit').addEventListener('click', () => {
        document.getElementById('modal-overlay').classList.remove('show');
      });
      document.getElementById('confirm-exit').addEventListener('click', () => {
        ipcRenderer.send('close-window');
      });
      document.getElementById('modal-overlay').addEventListener('click', (event) => {
       if (event.target === document.getElementById('modal-overlay')) {
            document.getElementById('modal-overlay').classList.remove('show');
        }
        
      });
  require('electron').ipcRenderer.on('update-status', (event, message) => {
    const notification = document.getElementById('update-notification');
    notification.style.display = 'block';
    document.getElementById('update-message').textContent = message;
  });

  require('electron').ipcRenderer.on('update-ready', (event, version) => {
    const result = confirm('Versión '+version+ ' descargada. ¿Reiniciar ahora para instalar?');
    if (result) {
      require('electron').ipcRenderer.send('restart-app');
    }
  });


// Inicializar el zoom al 100%
 let currentZoom = 1.0;

 // Función para actualizar el nivel de zoom en la interfaz
 function updateZoomLevel(zoomFactor) {
   document.getElementById('zoom-level').textContent = Math.round(zoomFactor * 100) + '%';
 }

 // Botón para aumentar el zoom
 document.getElementById('zoom-in').addEventListener('click', () => {
   currentZoom += 0.1; // Incrementar el zoom en 10%
   ipcRenderer.send('set-zoom-factor', currentZoom);
 });

 // Botón para reducir el zoom
 document.getElementById('zoom-out').addEventListener('click', () => {
   currentZoom -= 0.1; // Reducir el zoom en 10%
   if (currentZoom < 0.1) currentZoom = 0.1; // Evitar zoom negativo
   ipcRenderer.send('set-zoom-factor', currentZoom);
 });

 // Escuchar cambios de zoom desde el proceso principal
 ipcRenderer.on('update-zoom-level', (event, zoomFactor) => {
   currentZoom = zoomFactor;
   updateZoomLevel(zoomFactor);
 });

 // Inicializar el nivel de zoom
 updateZoomLevel(1.0);




      
    `);

    win.webContents.insertCSS(`
      .title-bar { 
        cursor: pointer; 
        margin: 0; 
        display: flex; 
        align-items: center; 
        position: absolute; 
        height: 15px; 
        width: 100%;  
        -webkit-app-region: drag;
        z-index: 20;

  font-size: 14px;
      } 
        .title-bar-2 { 
        height: 10px; 
        position: absolute; 
        margin: 0; 
        padding: 0;
        top: 5px;
        left: 5px;
        
        }

  


      #minimize, #maximize, #close, #zoom-in, #zoom-out{ 
        cursor: pointer; 
        background: none; 
        margin: 0.5px; 
        padding: 5px;
        transition: all 0.3s ease-in-out; 
        -webkit-app-region: no-drag; 
        box-shadow: inset 0px 0px 10px rgba(0, 0, 0, 0.57); 
        width: 30px; 
        color: white;  
        border: none;
        border-radius: 5px; 
        background:rgba(149, 151, 255, 0.31);
      } 
#zoom-in, #zoom-out{ 
        margin: 0; 
    }
      #minimize:hover, #maximize:hover, #close:hover, #zoom-in:hover, #zoom-out:hover {
        color: black; 
        box-shadow: inset 0px 0px 10px rgba(38, 0, 255, 0.57); 
        background: #ffffffdd;
      }
        
 

      .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-overlay.show {
    display: flex;
    opacity: 1;
}
.modal-content3 {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 90%;
    max-width: 400px;
    border-radius: 10px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
}

.modal-content3 h2 {
    color: #333;
    margin-bottom: 15px;
    font-weight: 600;
}

.modal-content3 p {
    color: #666;
    margin-bottom: 25px;
}

.modal-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.btn3 {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-exit3 {
    background: linear-gradient(135deg, #ff6b6b, #ff4757);
    color: white;
}

.btn-cancel3 {
    background: linear-gradient(135deg, #4ecdc4, #45b7d1);
    color: white;
}

.btn3:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
.zoom-controls {
    display: inline-flex;
  margin-left: 10px;
        padding: 0;
    justify-content: center;
    align-items: center;

    border: none;
    border-radius: 5px;
        box-shadow: inset 0px 0px 10px rgba(0, 0, 0, 0.57); 
}
.zoom-controls:hover > #zoom-level {
 color: black; 
}


#zoom-level {
        transition: all 0.3s ease-in-out; 
  margin: 0 5px;
  color: rgba(38, 0, 255, 0.57);
}

    `);
  });
  win.webContents.setZoomFactor(1.0); // Establecer zoom inicial en 100%
  win.webContents.send('update-zoom-level', 1.0);
  // Registrar atajos de teclado para el zoom

  globalShortcut.register('CommandOrControl+=', () => {
    let currentZoom = win.webContents.getZoomFactor();
    currentZoom += 0.1; // Incrementar el zoom en 10%
    win.webContents.setZoomFactor(currentZoom);
    win.webContents.send('update-zoom-level', currentZoom); // Notificar al renderizado
  });

  // Reducir zoom (Ctrl -)
  globalShortcut.register('CommandOrControl+-', () => {
    let currentZoom = win.webContents.getZoomFactor();
    currentZoom -= 0.1; // Reducir el zoom en 10%
    if (currentZoom < 0.1) currentZoom = 0.1; // Evitar zoom negativo
    win.webContents.setZoomFactor(currentZoom);
    win.webContents.send('update-zoom-level', currentZoom); // Notificar al renderizado
  });

  // Restablecer zoom (Ctrl 0)
  globalShortcut.register('CommandOrControl+0', () => {
    win.webContents.setZoomFactor(1.0); // Restablecer al 100%
    win.webContents.send('update-zoom-level', 1.0); // Notificar al renderizado
  });

  // Evento para establecer el factor de zoom
  ipcMain.on('set-zoom-factor', (event, zoomFactor) => {
    win.webContents.setZoomFactor(zoomFactor); // Aplicar el zoom
    win.webContents.send('update-zoom-level', zoomFactor); // Notificar al renderizado
  });


  // Manejo de eventos de la barra de título personalizada
  ipcMain.on('minimize-window', () => {
    win.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on('close-window', () => {
    win.close();

    globalShortcut.unregisterAll();
  });
}

app.whenReady().then(async () => {
  try {
    await createServer(); // Completar creación del servidor antes de continuar

    autoUpdater.checkForUpdatesAndNotify(); // Asegúrate de usar await aquí

    // resolve(io);
    // Crear la ventana
    createWindow();

  } catch (error) {
    console.error('Error al iniciar la aplicación:', error.message);
    app.quit();
    globalShortcut.unregisterAll();
  }
});




// Modificar app.on('window-all-closed')
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('Cerrando aplicación...');


    app.quit();
    globalShortcut.unregisterAll();
    // Forzar cierre después de 5 segundos
    setTimeout(() => {
      console.log('Forzando cierre...');

    app.quit();
    globalShortcut.unregisterAll();
      process.exit(1);
    }, 1000);
  }
});
module.exports = { sendMessage, port };