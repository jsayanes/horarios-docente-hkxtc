# Configuración de MySQL para Horarios Docente

Este proyecto utiliza **MySQL** como base de datos para almacenar los horarios de manera persistente y permitir sincronización entre navegadores.

## 📋 Requisitos Previos

1. **MySQL Server** instalado y ejecutándose
2. **Node.js** y **npm** instalados
3. Permisos para crear bases de datos

## ⚙️ Configuración de MySQL

### 1. Configuración del Servidor MySQL

Asegúrate de que MySQL esté configurado con los siguientes parámetros:

```
Host: localhost
Puerto: 3310
Usuario: root
Contraseña: root
```

### 2. Verificar MySQL

```bash
# Verificar que MySQL esté ejecutándose en el puerto correcto
netstat -an | find "3310"

# O conectar directamente
mysql -h localhost -P 3310 -u root -p
```

### 3. Configuración Automática de la Base de Datos

El proyecto incluye un script automático para configurar la base de datos:

```bash
# Desde la carpeta horarios-docente
npm run setup-db
```

Este script:
- ✅ Crea la base de datos `horarios_docente`
- ✅ Crea la tabla `horarios`
- ✅ Inserta los datos iniciales de Pablo Sayanes
- ✅ Configura índices y restricciones

## 🚀 Ejecutar la Aplicación

```bash
# Iniciar frontend y backend juntos
npm run dev

# O por separado:
npm run backend    # Solo backend
npm start         # Solo frontend
```

## 🔍 Verificación

### Endpoints de Verificación

1. **Estado del servidor:**
   ```
   GET http://localhost:3001/api/health
   ```

2. **Estado de la base de datos:**
   ```
   GET http://localhost:3001/api/db-status
   ```

### Verificación en MySQL

```sql
USE horarios_docente;
SELECT COUNT(*) as total_celdas FROM horarios;
SELECT COUNT(*) as clases_ocupadas FROM horarios WHERE is_empty = FALSE;
```

## 📊 Estructura de la Base de Datos

### Tabla: `horarios`

| Campo        | Tipo                                                          | Descripción                    |
|--------------|---------------------------------------------------------------|--------------------------------|
| id           | INT AUTO_INCREMENT PRIMARY KEY                               | ID único                       |
| profesor     | VARCHAR(100) NOT NULL                                         | Nombre del profesor            |
| dia_semana   | ENUM('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES')        | Día de la semana              |
| bloque_id    | VARCHAR(10) NOT NULL                                          | ID del bloque horario (0-8)   |
| clase_nombre | VARCHAR(100)                                                  | Nombre de la clase             |
| clase_color  | VARCHAR(20)                                                   | Color de la clase (hex)        |
| is_empty     | BOOLEAN DEFAULT FALSE                                         | Si la celda está vacía         |
| created_at   | TIMESTAMP DEFAULT CURRENT_TIMESTAMP                          | Fecha de creación              |
| updated_at   | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Última actualización       |

### Índices

- **Clave única:** `unique_horario (profesor, dia_semana, bloque_id)`

## 🛠️ Solución de Problemas

### Error: "Base de datos no disponible"

```bash
# Verificar que MySQL esté ejecutándose
mysqladmin -h localhost -P 3310 -u root -p ping

# Reiniciar MySQL si es necesario
sudo service mysql restart
```

### Error: "Access denied"

Verificar credenciales:
- Usuario: `root`
- Contraseña: `root`
- Puerto: `3310`

### Error: "Can't connect to MySQL server"

1. Verificar que MySQL esté ejecutándose
2. Verificar que el puerto 3310 esté disponible
3. Verificar configuración de firewall

## 🔄 Funcionalidades

- ✅ **Persistencia:** Todos los cambios se guardan automáticamente
- ✅ **Sincronización:** Cambios visibles en todos los navegadores
- ✅ **Drag & Drop:** Arrastra clases entre celdas
- ✅ **Reset:** Restaura horario original
- ✅ **Validación:** Previene conflictos de horarios

## 📝 Datos Iniciales

El sistema viene con un horario de ejemplo para "Pablo Sayanes" con las siguientes clases:
- **9°1** (Lunes 2°-3°) - Color: #FF6B6B
- **9°2** (Martes 1°-2°) - Color: #45B7D1  
- **9°3** (Miércoles 2°-3°) - Color: #FFEAA7
- **9°4** (Jueves 1°-2°) - Color: #FD79A8
- **8°1** (Lunes 5°-6°) - Color: #4ECDC4
- **8°2** (Martes 4°-5°) - Color: #96CEB4
- **8°3** (Miércoles 5°-6°) - Color: #DDA0DD 
