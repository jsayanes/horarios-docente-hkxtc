// Modelo para representar una clase individual
export interface Clase {
  id?: string;                   // Identificador único de la clase (opcional para compatibilidad)
  nombre?: string;               // Nombre completo de la clase (ej: "9°1", "8°2") - usado por backend
  grado?: string;                // Por ejemplo: "9°", "8°" - usado por frontend local
  seccion?: string;              // Por ejemplo: "1", "2", "3", "4" - usado por frontend local
  color: string;                // Color de fondo para la visualización
  materia?: string;             // Opcional: nombre de la materia
}

// Modelo para representar un bloque de horario
export interface BloqueHorario {
  id: string;                   // Identificador único del bloque
  horaInicio: string;           // Hora de inicio (ej: "12:10")
  horaFin: string;              // Hora de fin (ej: "12:55")
  timeSlot: string;             // Representación completa (ej: "12:10 - 12:55")
}

// Modelo para una celda de la tabla (intersección día-horario)
export interface CeldaHorario {
  bloqueId: string;             // ID del bloque de horario
  dia: DiaSemana;               // Día de la semana
  clase: Clase | null;          // Clase asignada (null si está vacía)
  isEmpty: boolean;             // Indica si la celda está vacía
}

// Enumeration para los días de la semana
export enum DiaSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIÉRCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES'
}

// Modelo completo para el horario semanal
export interface HorarioSemanal {
  profesor: string;             // Nombre del profesor
  celdas: CeldaHorario[];       // Array de todas las celdas de la tabla
  fechaModificacion: Date;      // Última fecha de modificación
}

// Modelo para representar el estado de drag & drop
export interface DragDropData {
  clase: Clase;
  origenBloqueId: string;
  origenDia: DiaSemana;
}

// Colores disponibles para las clases
export const COLORES_CLASES = {
  NARANJA: '#ff8c42',
  ROJO: '#e74c3c',
  VERDE: '#27ae60',
  MORADO: '#9b59b6',
  MORADO_CLARO: '#af7ac5',
  DURAZNO: '#f8c471',
  AZUL: '#3498db',
  AZUL_OSCURO: '#2471a3'
};
