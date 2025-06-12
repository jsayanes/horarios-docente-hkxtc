const express = require('express');
const cors = require('cors');
const {
  initializeDatabase,
  obtenerHorarios,
  guardarHorarios,
  resetearHorarios
} = require('./config/database');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Variable para verificar si la BD está conectada
let dbConnected = false;

// Inicializar base de datos al arrancar el servidor
async function iniciarServidor() {
  console.log('🚀 Iniciando servidor backend...');

  // Intentar conectar a la base de datos
  dbConnected = await initializeDatabase();

  if (dbConnected) {
    console.log('💾 Sistema de persistencia: MySQL');
    console.log('📊 Base de datos: horarios_docente');
  } else {
    console.log('⚠️  Advertencia: No se pudo conectar a MySQL');
    console.log('   El servidor funcionará pero sin persistencia');
  }
}

// GET - Obtener horarios
app.get('/api/horarios', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(503).json({
        error: 'Base de datos no disponible',
        message: 'Verifica que MySQL esté ejecutándose en puerto 3310'
      });
    }

    const horarios = await obtenerHorarios('Pablo Sayanes');

    if (horarios && horarios.celdas.length > 0) {
      const clasesCount = horarios.celdas.filter(c => !c.isEmpty).length;
      console.log(`📖 Horarios enviados al cliente - ${clasesCount} clases`);
      res.json(horarios);
    } else {
      console.log('❌ No se encontraron horarios en la base de datos');
      res.status(404).json({ message: 'No hay horarios guardados' });
    }
  } catch (error) {
    console.error('Error en GET /api/horarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST - Guardar horarios
app.post('/api/horarios', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(503).json({
        error: 'Base de datos no disponible',
        message: 'Verifica que MySQL esté ejecutándose en puerto 3310'
      });
    }

    const horarios = req.body;

    // Validación básica
    if (!horarios || !horarios.profesor || !Array.isArray(horarios.celdas)) {
      return res.status(400).json({ error: 'Datos de horarios inválidos' });
    }

    const exito = await guardarHorarios(horarios);

    if (exito) {
      const clasesCount = horarios.celdas.filter(c => !c.isEmpty).length;
      console.log(`💾 Horarios guardados en MySQL - ${clasesCount} clases`);
      res.json({ message: 'Horarios guardados exitosamente en MySQL' });
    } else {
      res.status(500).json({ error: 'Error al guardar horarios en MySQL' });
    }
  } catch (error) {
    console.error('Error en POST /api/horarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE - Eliminar horarios (para reset)
app.delete('/api/horarios', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(503).json({
        error: 'Base de datos no disponible',
        message: 'Verifica que MySQL esté ejecutándose en puerto 3310'
      });
    }

    const exito = await resetearHorarios('Pablo Sayanes');

    if (exito) {
      console.log('🗑️ Horarios eliminados de MySQL');
      res.json({ message: 'Horarios eliminados exitosamente de MySQL' });
    } else {
      res.status(500).json({ error: 'Error al eliminar horarios de MySQL' });
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
    database: dbConnected ? 'MySQL Connected' : 'MySQL Disconnected',
    port: PORT
  });
});

// Endpoint para verificar conexión de base de datos
app.get('/api/db-status', (req, res) => {
  res.json({
    connected: dbConnected,
    database: 'horarios_docente',
    host: 'localhost',
    port: 3310
  });
});

// Inicializar servidor
iniciarServidor().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend iniciado en puerto ${PORT}`);
    console.log(`🌐 Endpoints disponibles:`);
    console.log(`   GET  http://localhost:${PORT}/api/horarios`);
    console.log(`   POST http://localhost:${PORT}/api/horarios`);
    console.log(`   DELETE http://localhost:${PORT}/api/horarios`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log(`   GET  http://localhost:${PORT}/api/db-status`);

    if (dbConnected) {
      console.log('✅ Sistema listo para uso con MySQL');
    } else {
      console.log('⚠️  Sistema iniciado sin conexión a MySQL');
    }
  });
});
