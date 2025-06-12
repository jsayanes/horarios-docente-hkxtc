const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuración de conexión (sin especificar database)
const connectionConfig = {
  host: 'localhost',
  port: 3310,
  user: 'root',
  password: 'root'
};

async function setupDatabase() {
  let connection;

  try {
    console.log('🔄 Configurando base de datos MySQL...');
    console.log(`📍 Conectando a MySQL en ${connectionConfig.host}:${connectionConfig.port}`);

    // Conectar a MySQL (sin especificar base de datos)
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Conexión exitosa a MySQL');

    // Crear base de datos primero
    console.log('🏗️  Creando base de datos...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS horarios_docente CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE horarios_docente`);
    console.log('✅ Base de datos horarios_docente creada/seleccionada');

    // Crear tabla
    console.log('📋 Creando tabla horarios...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS horarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        profesor VARCHAR(100) NOT NULL,
        dia_semana ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES') NOT NULL,
        bloque_id VARCHAR(10) NOT NULL,
        clase_nombre VARCHAR(100),
        clase_color VARCHAR(20),
        is_empty BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_horario (profesor, dia_semana, bloque_id)
      )
    `;

    await connection.query(createTableSQL);
    console.log('✅ Tabla horarios creada');

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await connection.execute(`DELETE FROM horarios WHERE profesor = ?`, ['Pablo Sayanes']);

    // Insertar datos iniciales
    console.log('📝 Insertando datos iniciales...');

    const datosIniciales = [
      ['Pablo Sayanes', 'LUNES', '0', null, null, true],
      ['Pablo Sayanes', 'LUNES', '1', null, null, true],
      ['Pablo Sayanes', 'LUNES', '2', '9°1', '#FF6B6B', false],
      ['Pablo Sayanes', 'LUNES', '3', '9°1', '#FF6B6B', false],
      ['Pablo Sayanes', 'LUNES', '4', null, null, true],
      ['Pablo Sayanes', 'LUNES', '5', '8°1', '#4ECDC4', false],
      ['Pablo Sayanes', 'LUNES', '6', '8°1', '#4ECDC4', false],
      ['Pablo Sayanes', 'LUNES', '7', null, null, true],
      ['Pablo Sayanes', 'LUNES', '8', null, null, true],

      ['Pablo Sayanes', 'MARTES', '0', null, null, true],
      ['Pablo Sayanes', 'MARTES', '1', '9°2', '#45B7D1', false],
      ['Pablo Sayanes', 'MARTES', '2', '9°2', '#45B7D1', false],
      ['Pablo Sayanes', 'MARTES', '3', null, null, true],
      ['Pablo Sayanes', 'MARTES', '4', '8°2', '#96CEB4', false],
      ['Pablo Sayanes', 'MARTES', '5', '8°2', '#96CEB4', false],
      ['Pablo Sayanes', 'MARTES', '6', null, null, true],
      ['Pablo Sayanes', 'MARTES', '7', null, null, true],
      ['Pablo Sayanes', 'MARTES', '8', null, null, true],

      ['Pablo Sayanes', 'MIERCOLES', '0', null, null, true],
      ['Pablo Sayanes', 'MIERCOLES', '1', null, null, true],
      ['Pablo Sayanes', 'MIERCOLES', '2', '9°3', '#FFEAA7', false],
      ['Pablo Sayanes', 'MIERCOLES', '3', '9°3', '#FFEAA7', false],
      ['Pablo Sayanes', 'MIERCOLES', '4', null, null, true],
      ['Pablo Sayanes', 'MIERCOLES', '5', '8°3', '#DDA0DD', false],
      ['Pablo Sayanes', 'MIERCOLES', '6', '8°3', '#DDA0DD', false],
      ['Pablo Sayanes', 'MIERCOLES', '7', null, null, true],
      ['Pablo Sayanes', 'MIERCOLES', '8', null, null, true],

      ['Pablo Sayanes', 'JUEVES', '0', null, null, true],
      ['Pablo Sayanes', 'JUEVES', '1', '9°4', '#FD79A8', false],
      ['Pablo Sayanes', 'JUEVES', '2', '9°4', '#FD79A8', false],
      ['Pablo Sayanes', 'JUEVES', '3', null, null, true],
      ['Pablo Sayanes', 'JUEVES', '4', null, null, true],
      ['Pablo Sayanes', 'JUEVES', '5', null, null, true],
      ['Pablo Sayanes', 'JUEVES', '6', null, null, true],
      ['Pablo Sayanes', 'JUEVES', '7', null, null, true],
      ['Pablo Sayanes', 'JUEVES', '8', null, null, true],

      ['Pablo Sayanes', 'VIERNES', '0', null, null, true],
      ['Pablo Sayanes', 'VIERNES', '1', null, null, true],
      ['Pablo Sayanes', 'VIERNES', '2', null, null, true],
      ['Pablo Sayanes', 'VIERNES', '3', null, null, true],
      ['Pablo Sayanes', 'VIERNES', '4', null, null, true],
      ['Pablo Sayanes', 'VIERNES', '5', null, null, true],
      ['Pablo Sayanes', 'VIERNES', '6', null, null, true],
      ['Pablo Sayanes', 'VIERNES', '7', null, null, true],
      ['Pablo Sayanes', 'VIERNES', '8', null, null, true]
    ];

    const insertSQL = `INSERT INTO horarios (profesor, dia_semana, bloque_id, clase_nombre, clase_color, is_empty) VALUES (?, ?, ?, ?, ?, ?)`;

    for (const fila of datosIniciales) {
      await connection.execute(insertSQL, fila);
    }

    // Verificar datos insertados
    const [rows] = await connection.execute(`SELECT COUNT(*) as total FROM horarios WHERE profesor = ?`, ['Pablo Sayanes']);
    const [clases] = await connection.execute(`SELECT COUNT(*) as clases FROM horarios WHERE profesor = ? AND is_empty = FALSE`, ['Pablo Sayanes']);

    console.log(`✅ Datos insertados: ${rows[0].total} celdas totales, ${clases[0].clases} clases`);
    console.log('');
    console.log('🎉 ¡Configuración completada exitosamente!');
    console.log('   Base de datos: horarios_docente');
    console.log('   Tabla: horarios');
    console.log('   Profesor: Pablo Sayanes');
    console.log('');
    console.log('🚀 Ahora puedes ejecutar: npm run dev');

  } catch (error) {
    console.error('❌ Error configurando la base de datos:');
    console.error(`   ${error.message}`);
    console.error('');
    console.error('💡 Verificaciones:');
    console.error('   1. ¿MySQL está ejecutándose?');
    console.error('   2. ¿Puerto 3310 está disponible?');
    console.error('   3. ¿Usuario/password son correctos (root/root)?');
    console.error('   4. ¿Tienes permisos para crear bases de datos?');

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar configuración
setupDatabase();
