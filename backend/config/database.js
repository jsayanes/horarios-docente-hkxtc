const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  port: 3310,
  user: 'root',
  password: 'root',
  database: 'horarios_docente',
  charset: 'utf8mb4',
  // Configuraciones adicionales para mejor rendimiento
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Crear pool de conexiones para mejor rendimiento
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    // Probar conexión
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a MySQL');
    connection.release();

    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    console.error('   Verifica que MySQL esté ejecutándose en puerto 3310');
    console.error('   Usuario: root, Password: root');
    return false;
  }
}

// Función para ejecutar consultas
async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return { success: true, data: results };
  } catch (error) {
    console.error('Error en consulta SQL:', error.message);
    return { success: false, error: error.message };
  }
}

// Función para obtener horarios de la base de datos
async function obtenerHorarios(profesor = 'Pablo Sayanes') {
  const query = `
    SELECT
      dia_semana,
      bloque_id,
      clase_nombre,
      clase_color,
      is_empty
    FROM horarios
    WHERE profesor = ?
    ORDER BY
      FIELD(dia_semana, 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'),
      CAST(bloque_id AS UNSIGNED)
  `;

  const result = await executeQuery(query, [profesor]);

  if (!result.success) {
    return null;
  }

  // Convertir datos de MySQL al formato esperado por el frontend
  const celdas = [];
  const horariosMap = {};

  // Organizar por día y bloque
  result.data.forEach(row => {
    const key = `${row.dia_semana}_${row.bloque_id}`;
    horariosMap[key] = {
      nombre: row.clase_nombre,
      color: row.clase_color,
      isEmpty: row.is_empty
    };
  });

  // Crear todas las celdas (5 días x 9 bloques = 45 celdas)
  const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
  const bloques = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];

  dias.forEach(dia => {
    bloques.forEach(bloque => {
      const key = `${dia}_${bloque}`;
      const celda = horariosMap[key] || { nombre: null, color: null, isEmpty: true };

      celdas.push({
        dia,
        bloqueId: bloque,
        clase: celda.isEmpty ? null : {
          nombre: celda.nombre,
          color: celda.color
        },
        isEmpty: celda.isEmpty
      });
    });
  });

  return {
    profesor: profesor,
    celdas: celdas
  };
}

// Función para guardar horarios en la base de datos
async function guardarHorarios(horarios) {
  try {
    // Eliminar horarios existentes del profesor
    await executeQuery('DELETE FROM horarios WHERE profesor = ?', [horarios.profesor]);

    // Insertar nuevos horarios
    const insertQuery = `
      INSERT INTO horarios (profesor, dia_semana, bloque_id, clase_nombre, clase_color, is_empty)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    for (const celda of horarios.celdas) {
      await executeQuery(insertQuery, [
        horarios.profesor,
        celda.dia,
        celda.bloqueId,
        celda.clase?.nombre || null,
        celda.clase?.color || null,
        celda.isEmpty
      ]);
    }

    return true;
  } catch (error) {
    console.error('Error guardando horarios:', error.message);
    return false;
  }
}

// Función para resetear horarios (eliminar todos los datos)
async function resetearHorarios(profesor = 'Pablo Sayanes') {
  const result = await executeQuery('DELETE FROM horarios WHERE profesor = ?', [profesor]);
  return result.success;
}

module.exports = {
  pool,
  initializeDatabase,
  executeQuery,
  obtenerHorarios,
  guardarHorarios,
  resetearHorarios
};
