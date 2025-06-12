/**
 * 🌐 Servidor Backend Simplificado para Horarios
 *
 * Este servidor NO requiere MySQL - usa archivos JSON para persistencia
 * Perfecto para desarrollo y uso personal
 *
 * PARA USAR ESTE SERVIDOR:
 * 1. En package.json, cambia el script "backend" por:
 *    "backend": "node backend/server-simple.js"
 * 2. Ejecuta: npm run backend
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Archivo donde se guardan los datos
const DATA_FILE = path.join(__dirname, 'data', 'horarios.json');
const DATA_DIR = path.join(__dirname, 'data');

// Datos por defecto
const DATOS_INICIALES = {
  profesor: 'Pablo Sayanes',
  fechaModificacion: new Date().toISOString(),
  celdas: []
};

// Función para asegurar que existe el directorio de datos
async function asegurarDirectorio() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('📁 Directorio de datos creado');
  }
}

// Función para cargar datos del archivo
async function cargarDatos() {
  try {
    const contenido = await fs.readFile(DATA_FILE, 'utf8');
    const datos = JSON.parse(contenido);

    // Validación básica
    if (datos && datos.profesor && Array.isArray(datos.celdas)) {
      return datos;
    }

    console.log('⚠️ Datos inválidos en archivo, usando datos iniciales');
    return null;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📝 Archivo de datos no existe, se creará uno nuevo');
    } else {
      console.log('❌ Error leyendo archivo de datos:', error.message);
    }
    return null;
  }
}

// Función para guardar datos al archivo
async function guardarDatos(datos) {
  try {
    await asegurarDirectorio();

    // Validar datos antes de guardar
    if (!datos || !datos.profesor || !Array.isArray(datos.celdas)) {
      throw new Error('Datos inválidos para guardar');
    }

    const contenido = JSON.stringify(datos, null, 2);
    await fs.writeFile(DATA_FILE, contenido, 'utf8');

    console.log(`💾 Datos guardados: ${datos.celdas.filter(c => !c.isEmpty).length} clases`);
    return true;
  } catch (error) {
    console.error('❌ Error guardando datos:', error.message);
    return false;
  }
}

// Función para inicializar datos por defecto
function crearDatosIniciales() {
  const datos = { ...DATOS_INICIALES };

  // Generar todas las celdas vacías
  const dias = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
  const bloques = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];

  dias.forEach(dia => {
    bloques.forEach(bloque => {
      datos.celdas.push({
        bloqueId: bloque,
        dia: dia,
        clase: null,
        isEmpty: true
      });
    });
  });

  // Asignar clases específicas
  const asignaciones = [
    // LUNES
    { dia: 'LUNES', bloque: '0', clase: { id: 'lunes-0', nombre: '9°4', grado: '9°', seccion: '4', color: '#FD79A8' } },
    { dia: 'LUNES', bloque: '5', clase: { id: 'lunes-5', nombre: '9°1', grado: '9°', seccion: '1', color: '#A29BFE' } },
    { dia: 'LUNES', bloque: '6', clase: { id: 'lunes-6', nombre: '8°1', grado: '8°', seccion: '1', color: '#6C5CE7' } },
    { dia: 'LUNES', bloque: '7', clase: { id: 'lunes-7', nombre: '8°1', grado: '8°', seccion: '1', color: '#6C5CE7' } },
    { dia: 'LUNES', bloque: '8', clase: { id: 'lunes-8', nombre: '9°1', grado: '9°', seccion: '1', color: '#A29BFE' } },

    // MARTES
    { dia: 'MARTES', bloque: '3', clase: { id: 'martes-3', nombre: '8°3', grado: '8°', seccion: '3', color: '#00B894' } },
    { dia: 'MARTES', bloque: '5', clase: { id: 'martes-5', nombre: '8°1', grado: '8°', seccion: '1', color: '#6C5CE7' } },
    { dia: 'MARTES', bloque: '7', clase: { id: 'martes-7', nombre: '9°2', grado: '9°', seccion: '2', color: '#0984E3' } },
    { dia: 'MARTES', bloque: '8', clase: { id: 'martes-8', nombre: '9°3', grado: '9°', seccion: '3', color: '#FFEAA7' } },

    // MIÉRCOLES
    { dia: 'MIÉRCOLES', bloque: '6', clase: { id: 'miercoles-6', nombre: '9°3', grado: '9°', seccion: '3', color: '#FFEAA7' } },
    { dia: 'MIÉRCOLES', bloque: '7', clase: { id: 'miercoles-7', nombre: '8°2', grado: '8°', seccion: '2', color: '#E84393' } },
    { dia: 'MIÉRCOLES', bloque: '8', clase: { id: 'miercoles-8', nombre: '9°3', grado: '9°', seccion: '3', color: '#FFEAA7' } },

    // JUEVES
    { dia: 'JUEVES', bloque: '1', clase: { id: 'jueves-1', nombre: '9°4', grado: '9°', seccion: '4', color: '#FD79A8' } },
    { dia: 'JUEVES', bloque: '3', clase: { id: 'jueves-3', nombre: '8°3', grado: '8°', seccion: '3', color: '#00B894' } },
    { dia: 'JUEVES', bloque: '4', clase: { id: 'jueves-4', nombre: '8°2', grado: '8°', seccion: '2', color: '#E84393' } },
    { dia: 'JUEVES', bloque: '7', clase: { id: 'jueves-7', nombre: '9°2', grado: '9°', seccion: '2', color: '#0984E3' } },
    { dia: 'JUEVES', bloque: '8', clase: { id: 'jueves-8', nombre: '9°2', grado: '9°', seccion: '2', color: '#0984E3' } },

    // VIERNES
    { dia: 'VIERNES', bloque: '1', clase: { id: 'viernes-1', nombre: '8°2', grado: '8°', seccion: '2', color: '#E84393' } },
    { dia: 'VIERNES', bloque: '3', clase: { id: 'viernes-3', nombre: '9°4', grado: '9°', seccion: '4', color: '#FD79A8' } },
    { dia: 'VIERNES', bloque: '5', clase: { id: 'viernes-5', nombre: '9°1', grado: '9°', seccion: '1', color: '#A29BFE' } },
    { dia: 'VIERNES', bloque: '7', clase: { id: 'viernes-7', nombre: '8°3', grado: '8°', seccion: '3', color: '#00B894' } }
  ];

  // Aplicar asignaciones
  asignaciones.forEach(asignacion => {
    const celda = datos.celdas.find(c =>
      c.dia === asignacion.dia && c.bloqueId === asignacion.bloque
    );
    if (celda) {
      celda.clase = asignacion.clase;
      celda.isEmpty = false;
    }
  });

  return datos;
}

// GET - Obtener horarios
app.get('/api/horarios', async (req, res) => {
  try {
    let datos = await cargarDatos();

    if (!datos) {
      // No hay datos, crear datos iniciales
      datos = crearDatosIniciales();
      await guardarDatos(datos);
      console.log('🆕 Datos iniciales creados y guardados');
    }

    const clasesCount = datos.celdas.filter(c => !c.isEmpty).length;
    console.log(`📖 Horarios enviados al cliente - ${clasesCount} clases`);

    res.json(datos);
  } catch (error) {
    console.error('Error en GET /api/horarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Guardar horarios
app.post('/api/horarios', async (req, res) => {
  try {
    const horarios = req.body;

    // Validación básica
    if (!horarios || !horarios.profesor || !Array.isArray(horarios.celdas)) {
      return res.status(400).json({ error: 'Datos de horarios inválidos' });
    }

    // Asegurar que fechaModificacion esté actualizada
    horarios.fechaModificacion = new Date().toISOString();

    const exito = await guardarDatos(horarios);

    if (exito) {
      const clasesCount = horarios.celdas.filter(c => !c.isEmpty).length;
      console.log(`💾 Horarios guardados - ${clasesCount} clases`);
      res.json({ message: 'Horarios guardados exitosamente' });
    } else {
      res.status(500).json({ error: 'Error al guardar horarios' });
    }
  } catch (error) {
    console.error('Error en POST /api/horarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar horarios (para reset)
app.delete('/api/horarios', async (req, res) => {
  try {
    // Crear datos iniciales frescos
    const datosIniciales = crearDatosIniciales();
    const exito = await guardarDatos(datosIniciales);

    if (exito) {
      console.log('🔄 Horarios reseteados a datos iniciales');
      res.json({ message: 'Horarios reseteados exitosamente' });
    } else {
      res.status(500).json({ error: 'Error al resetear horarios' });
    }
  } catch (error) {
    console.error('Error en DELETE /api/horarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'JSON File System',
    port: PORT,
    dataFile: DATA_FILE
  });
});

// Endpoint para verificar estado del sistema
app.get('/api/db-status', async (req, res) => {
  try {
    await fs.access(DATA_FILE);
    const stats = await fs.stat(DATA_FILE);

    res.json({
      connected: true,
      database: 'JSON File',
      dataFile: DATA_FILE,
      fileSize: `${(stats.size / 1024).toFixed(2)} KB`,
      lastModified: stats.mtime.toISOString()
    });
  } catch {
    res.json({
      connected: false,
      database: 'JSON File',
      dataFile: DATA_FILE,
      message: 'Archivo de datos no existe (se creará automáticamente)'
    });
  }
});

// Inicializar servidor
console.log('🚀 Iniciando servidor backend simplificado...');
console.log('💾 Sistema de persistencia: Archivos JSON');
console.log(`📁 Archivo de datos: ${DATA_FILE}`);

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend iniciado en puerto ${PORT}`);
  console.log(`🌐 Endpoints disponibles:`);
  console.log(`   GET  http://localhost:${PORT}/api/horarios`);
  console.log(`   POST http://localhost:${PORT}/api/horarios`);
  console.log(`   DELETE http://localhost:${PORT}/api/horarios`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/db-status`);
  console.log('✅ Sistema listo para uso SIN MySQL');
  console.log('🔄 Los cambios se sincronizarán entre navegadores');
});
