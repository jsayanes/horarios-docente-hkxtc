-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS horarios_docente CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE horarios_docente;

-- Crear tabla para almacenar los horarios
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

    -- Índice único para evitar duplicados
    UNIQUE KEY unique_horario (profesor, dia_semana, bloque_id)
);

-- Insertar datos iniciales si no existen
INSERT IGNORE INTO horarios (profesor, dia_semana, bloque_id, clase_nombre, clase_color, is_empty) VALUES
-- Datos de ejemplo para Pablo Sayanes
('Pablo Sayanes', 'LUNES', '0', NULL, NULL, TRUE),
('Pablo Sayanes', 'LUNES', '1', NULL, NULL, TRUE),
('Pablo Sayanes', 'LUNES', '2', '9°1', '#FF6B6B', FALSE),
('Pablo Sayanes', 'LUNES', '3', '9°1', '#FF6B6B', FALSE),
('Pablo Sayanes', 'LUNES', '4', NULL, NULL, TRUE),
('Pablo Sayanes', 'LUNES', '5', '8°1', '#4ECDC4', FALSE),
('Pablo Sayanes', 'LUNES', '6', '8°1', '#4ECDC4', FALSE),
('Pablo Sayanes', 'LUNES', '7', NULL, NULL, TRUE),
('Pablo Sayanes', 'LUNES', '8', NULL, NULL, TRUE),

('Pablo Sayanes', 'MARTES', '0', NULL, NULL, TRUE),
('Pablo Sayanes', 'MARTES', '1', '9°2', '#45B7D1', FALSE),
('Pablo Sayanes', 'MARTES', '2', '9°2', '#45B7D1', FALSE),
('Pablo Sayanes', 'MARTES', '3', NULL, NULL, TRUE),
('Pablo Sayanes', 'MARTES', '4', '8°2', '#96CEB4', FALSE),
('Pablo Sayanes', 'MARTES', '5', '8°2', '#96CEB4', FALSE),
('Pablo Sayanes', 'MARTES', '6', NULL, NULL, TRUE),
('Pablo Sayanes', 'MARTES', '7', NULL, NULL, TRUE),
('Pablo Sayanes', 'MARTES', '8', NULL, NULL, TRUE),

('Pablo Sayanes', 'MIERCOLES', '0', NULL, NULL, TRUE),
('Pablo Sayanes', 'MIERCOLES', '1', NULL, NULL, TRUE),
('Pablo Sayanes', 'MIERCOLES', '2', '9°3', '#FFEAA7', FALSE),
('Pablo Sayanes', 'MIERCOLES', '3', '9°3', '#FFEAA7', FALSE),
('Pablo Sayanes', 'MIERCOLES', '4', NULL, NULL, TRUE),
('Pablo Sayanes', 'MIERCOLES', '5', '8°3', '#DDA0DD', FALSE),
('Pablo Sayanes', 'MIERCOLES', '6', '8°3', '#DDA0DD', FALSE),
('Pablo Sayanes', 'MIERCOLES', '7', NULL, NULL, TRUE),
('Pablo Sayanes', 'MIERCOLES', '8', NULL, NULL, TRUE),

('Pablo Sayanes', 'JUEVES', '0', NULL, NULL, TRUE),
('Pablo Sayanes', 'JUEVES', '1', '9°4', '#FD79A8', FALSE),
('Pablo Sayanes', 'JUEVES', '2', '9°4', '#FD79A8', FALSE),
('Pablo Sayanes', 'JUEVES', '3', NULL, NULL, TRUE),
('Pablo Sayanes', 'JUEVES', '4', NULL, NULL, TRUE),
('Pablo Sayanes', 'JUEVES', '5', NULL, NULL, TRUE),
('Pablo Sayanes', 'JUEVES', '6', NULL, NULL, TRUE),
('Pablo Sayanes', 'JUEVES', '7', NULL, NULL, TRUE),
('Pablo Sayanes', 'JUEVES', '8', NULL, NULL, TRUE),

('Pablo Sayanes', 'VIERNES', '0', NULL, NULL, TRUE),
('Pablo Sayanes', 'VIERNES', '1', NULL, NULL, TRUE),
('Pablo Sayanes', 'VIERNES', '2', NULL, NULL, TRUE),
('Pablo Sayanes', 'VIERNES', '3', NULL, NULL, TRUE),
('Pablo Sayanes', 'VIERNES', '4', NULL, NULL, TRUE),
('Pablo Sayanes', 'VIERNES', '5', NULL, NULL, TRUE),
('Pablo Sayanes', 'VIERNES', '6', NULL, NULL, TRUE),
('Pablo Sayanes', 'VIERNES', '7', NULL, NULL, TRUE),
('Pablo Sayanes', 'VIERNES', '8', NULL, NULL, TRUE);
