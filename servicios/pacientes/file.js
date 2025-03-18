const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configuración de Multer para TXT
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const esTXT = file.mimetype === 'text/plain' && 
                 file.originalname.toLowerCase().endsWith('.txt');
    esTXT ? cb(null, true) : cb(new Error('Solo se permiten archivos .txt'));
  }
});

const procesarResultados = (contenido) => {
  const lineas = contenido.split('\n').filter(linea => linea.trim() !== '');
  const resultados = [];

  lineas.slice(1).forEach(linea => {
    const campos = linea.split('\t').map(c => c.trim());
    
    // Filtros requeridos
    if (campos[1] !== 'R-2' || campos[2] !== 'CROMATEST GLUCOSA') return;
    
    try {
      // Procesar fecha y hora
      const [fechaCompleta, hora] = campos[0].split(' ');
      const [dia, mes, anio] = fechaCompleta.split('/');
      
      // Procesar concentración
      const concentracion = campos[4].split(' ')[0];

      resultados.push({
        fecha: `${dia}-${mes}-${anio}`,
        hora: hora,
        prueba: campos[2],
        concentracion: parseFloat(concentracion)
      });
      
    } catch (error) {
      console.error('Error procesando línea:', error);
    }
  });

  return resultados;
};

// Ruta para subir archivos TXT
router.post('/', upload.single('archivo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ estatus: 'error', respuesta: 'No se subió ningún archivo' });
    }

    const contenido = req.file.buffer.toString('utf-8');
    const datosProcesados = procesarResultados(contenido);

    return res.status(200).json({
      estatus: 'éxito',
      respuesta: 'Datos filtrados correctamente',
      datos: datosProcesados
    });
  } catch (error) {
    return res.status(500).json({
      estatus: 'error',
      respuesta: error.message || 'Error al procesar el archivo'
    });
  }
});

module.exports = router;