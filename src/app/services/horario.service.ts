import { Injectable, signal, inject } from '@angular/core';
import {
  Clase,
  BloqueHorario,
  CeldaHorario,
  DiaSemana,
  HorarioSemanal,
  COLORES_CLASES
} from '../models/horario.model';
import { HorarioHttpService } from './horario-http.service';

@Injectable({
  providedIn: 'root'
})
export class HorarioService {
  private readonly STORAGE_KEY = 'horario-docente-pablo-sayanes-v4-fixed';
  private readonly httpService = inject(HorarioHttpService);

  // Señal reactiva para el horario actual
  public horarioActual = signal<HorarioSemanal>(this.inicializarHorario());

  constructor() {
    this.inicializar();
  }

  /**
   * Inicializa el servicio cargando datos desde localStorage o usando datos por defecto
   */
  private inicializar(): void {
    try {
      console.log('🔄 Inicializando horarios...');

      // Primero cargar desde localStorage o usar datos por defecto
      const datosLocales = this.cargarDesdeLocalStorage();

      if (datosLocales) {
        console.log('📱 Horarios cargados desde localStorage');
      } else {
        console.log('🆕 Inicializando con horario por defecto');
        const horarioInicial = this.inicializarHorario();
        this.horarioActual.set(horarioInicial);
        this.guardarEnLocalStorage();
      }

      // Luego intentar sincronizar con el servidor en segundo plano
      this.sincronizarConServidor();
    } catch (error) {
      console.error('❌ Error en inicialización:', error);
      // En caso de error, usar datos por defecto
      const horarioInicial = this.inicializarHorario();
      this.horarioActual.set(horarioInicial);
    }
  }

  /**
   * Sincroniza con el servidor en segundo plano
   */
  private sincronizarConServidor(): void {
    console.log('🌐 Iniciando sincronización con servidor...');

    this.httpService.cargarHorarios().subscribe({
      next: (horarioServidor) => {
        if (horarioServidor) {
          console.log('📥 Datos recibidos del servidor, validando...');

          // Validar datos del servidor antes de usarlos
          if (this.validarHorario(horarioServidor)) {
            console.log('✅ Datos del servidor válidos, sincronizando...');
            this.horarioActual.set(horarioServidor);
            this.guardarEnLocalStorage();
          } else {
            console.log('⚠️ Datos del servidor inválidos, manteniendo datos locales');
            // Si tenemos datos locales válidos, subir al servidor
            const datosLocales = this.horarioActual();
            if (this.validarHorario(datosLocales)) {
              console.log('📤 Subiendo datos locales válidos al servidor...');
              this.guardarEnServidor();
            }
          }
        } else {
          console.log('📭 No hay datos en servidor, subiendo datos locales...');
          this.guardarEnServidor();
        }
      },
      error: (error) => {
        console.log('📱 Sin conexión al servidor, usando datos locales');
        console.log('   Error:', error.message);
      }
    });
  }

  /**
   * Valida que un horario tenga la estructura correcta
   */
  private validarHorario(horario: HorarioSemanal): boolean {
    if (!horario || !horario.profesor || !horario.celdas || !Array.isArray(horario.celdas)) {
      console.log('❌ Validación fallida: estructura básica incorrecta');
      return false;
    }

    // Verificar número total de celdas
    const celdasEsperadas = Object.values(DiaSemana).length * 9; // 5 días × 9 bloques
    if (horario.celdas.length !== celdasEsperadas) {
      console.log(`❌ Validación fallida: celdas incorrectas ${horario.celdas.length}/${celdasEsperadas}`);
      return false;
    }

    // Verificar clases del miércoles específicamente
    const clasesMiercoles = horario.celdas.filter(c =>
      c.dia === DiaSemana.MIERCOLES && !c.isEmpty
    );

    if (clasesMiercoles.length < 3) {
      console.log(`❌ Validación fallida: miércoles incompleto ${clasesMiercoles.length}/3`);
      return false;
    }

    // Verificar que estén en los bloques correctos
    const bloquesEsperados = ['6', '7', '8'];
    const bloquesEncontrados = clasesMiercoles.map(c => c.bloqueId);
    const tieneBloquesCorrecto = bloquesEsperados.every(bloque =>
      bloquesEncontrados.includes(bloque)
    );

    if (!tieneBloquesCorrecto) {
      console.log('❌ Validación fallida: clases del miércoles en bloques incorrectos');
      console.log(`   Esperados: ${bloquesEsperados.join(', ')}`);
      console.log(`   Encontrados: ${bloquesEncontrados.join(', ')}`);
      return false;
    }

    console.log('✅ Horario válido');
    return true;
  }

  /**
   * Inicializa el horario con los datos base de Pablo Sayanes
   */
  private inicializarHorario(): HorarioSemanal {
    const bloquesHorario: BloqueHorario[] = [
      { id: '0', horaInicio: '12:10', horaFin: '12:55', timeSlot: '12:10 - 12:55' },
      { id: '1', horaInicio: '13:00', horaFin: '13:40', timeSlot: '13:00 - 13:40' },
      { id: '2', horaInicio: '13:40', horaFin: '14:20', timeSlot: '13:40 - 14:20' },
      { id: '3', horaInicio: '14:25', horaFin: '15:10', timeSlot: '14:25 - 15:10' },
      { id: '4', horaInicio: '15:15', horaFin: '16:00', timeSlot: '15:15 - 16:00' },
      { id: '5', horaInicio: '16:05', horaFin: '16:50', timeSlot: '16:05 - 16:50' },
      { id: '6', horaInicio: '16:55', horaFin: '17:35', timeSlot: '16:55 - 17:35' },
      { id: '7', horaInicio: '17:35', horaFin: '18:15', timeSlot: '17:35 - 18:15' },
      { id: '8', horaInicio: '18:15', horaFin: '19:00', timeSlot: '18:15 - 19:00' }
    ];

    // Crear celdas vacías inicialmente
    const celdas: CeldaHorario[] = [];
    const dias = Object.values(DiaSemana);

    dias.forEach(dia => {
      bloquesHorario.forEach(bloque => {
        celdas.push({
          bloqueId: bloque.id,
          dia: dia,
          clase: null,
          isEmpty: true
        });
      });
    });

    // Ahora asignar las clases específicas según el horario de la imagen
    const asignaciones = [
      // LUNES
      { dia: DiaSemana.LUNES, bloque: '0', clase: { id: 'lunes-0', nombre: '9°4', grado: '9°', seccion: '4', color: COLORES_CLASES.NARANJA } },
      { dia: DiaSemana.LUNES, bloque: '5', clase: { id: 'lunes-5', nombre: '9°1', grado: '9°', seccion: '1', color: COLORES_CLASES.MORADO_CLARO } },
      { dia: DiaSemana.LUNES, bloque: '6', clase: { id: 'lunes-6', nombre: '8°1', grado: '8°', seccion: '1', color: COLORES_CLASES.MORADO } },
      { dia: DiaSemana.LUNES, bloque: '7', clase: { id: 'lunes-7', nombre: '8°1', grado: '8°', seccion: '1', color: COLORES_CLASES.MORADO } },
      { dia: DiaSemana.LUNES, bloque: '8', clase: { id: 'lunes-8', nombre: '9°1', grado: '9°', seccion: '1', color: COLORES_CLASES.MORADO_CLARO } },

      // MARTES
      { dia: DiaSemana.MARTES, bloque: '3', clase: { id: 'martes-3', nombre: '8°3', grado: '8°', seccion: '3', color: COLORES_CLASES.VERDE } },
      { dia: DiaSemana.MARTES, bloque: '5', clase: { id: 'martes-5', nombre: '8°1', grado: '8°', seccion: '1', color: COLORES_CLASES.MORADO } },
      { dia: DiaSemana.MARTES, bloque: '7', clase: { id: 'martes-7', nombre: '9°2', grado: '9°', seccion: '2', color: COLORES_CLASES.AZUL } },
      { dia: DiaSemana.MARTES, bloque: '8', clase: { id: 'martes-8', nombre: '9°3', grado: '9°', seccion: '3', color: COLORES_CLASES.DURAZNO } },

      // MIÉRCOLES
      { dia: DiaSemana.MIERCOLES, bloque: '5', clase: { id: 'miercoles-5', nombre: '9°4', grado: '9°', seccion: '4', color: COLORES_CLASES.NARANJA } },
      { dia: DiaSemana.MIERCOLES, bloque: '6', clase: { id: 'miercoles-6', nombre: '9°3', grado: '9°', seccion: '3', color: COLORES_CLASES.DURAZNO } },
      { dia: DiaSemana.MIERCOLES, bloque: '7', clase: { id: 'miercoles-7', nombre: '8°2', grado: '8°', seccion: '2', color: COLORES_CLASES.ROJO } },
      { dia: DiaSemana.MIERCOLES, bloque: '8', clase: { id: 'miercoles-8', nombre: '9°3', grado: '9°', seccion: '3', color: COLORES_CLASES.DURAZNO } },

      // JUEVES

      { dia: DiaSemana.JUEVES, bloque: '3', clase: { id: 'jueves-3', nombre: '8°3', grado: '8°', seccion: '3', color: COLORES_CLASES.VERDE } },
      { dia: DiaSemana.JUEVES, bloque: '4', clase: { id: 'jueves-4', nombre: '8°2', grado: '8°', seccion: '2', color: COLORES_CLASES.ROJO } },
      { dia: DiaSemana.JUEVES, bloque: '7', clase: { id: 'jueves-7', nombre: '9°2', grado: '9°', seccion: '2', color: COLORES_CLASES.AZUL } },
      { dia: DiaSemana.JUEVES, bloque: '8', clase: { id: 'jueves-8', nombre: '9°2', grado: '9°', seccion: '2', color: COLORES_CLASES.AZUL } },

      // VIERNES
      { dia: DiaSemana.VIERNES, bloque: '1', clase: { id: 'viernes-1', nombre: '8°2', grado: '8°', seccion: '2', color: COLORES_CLASES.ROJO } },
      { dia: DiaSemana.VIERNES, bloque: '3', clase: { id: 'viernes-3', nombre: '9°4', grado: '9°', seccion: '4', color: COLORES_CLASES.NARANJA } },
      { dia: DiaSemana.VIERNES, bloque: '5', clase: { id: 'viernes-5', nombre: '9°1', grado: '9°', seccion: '1', color: COLORES_CLASES.MORADO_CLARO } },
      { dia: DiaSemana.VIERNES, bloque: '7', clase: { id: 'viernes-7', nombre: '8°3', grado: '8°', seccion: '3', color: COLORES_CLASES.VERDE } }
    ];

    // Aplicar las asignaciones
    asignaciones.forEach(asignacion => {
      const celda = celdas.find(c =>
        c.dia === asignacion.dia && c.bloqueId === asignacion.bloque
      );
      if (celda) {
        celda.clase = asignacion.clase;
        celda.isEmpty = false;
      }
    });

    console.log('📊 Horario inicial creado con', asignaciones.length, 'clases asignadas');

    return {
      profesor: 'Pablo Sayanes',
      celdas: celdas,
      fechaModificacion: new Date()
    };
  }

  /**
   * Obtiene todos los bloques de horario
   */
  public getBloques(): BloqueHorario[] {
    return [
      { id: '0', horaInicio: '12:10', horaFin: '12:55', timeSlot: '12:10 - 12:55' },
      { id: '1', horaInicio: '13:00', horaFin: '13:40', timeSlot: '13:00 - 13:40' },
      { id: '2', horaInicio: '13:40', horaFin: '14:20', timeSlot: '13:40 - 14:20' },
      { id: '3', horaInicio: '14:25', horaFin: '15:10', timeSlot: '14:25 - 15:10' },
      { id: '4', horaInicio: '15:15', horaFin: '16:00', timeSlot: '15:15 - 16:00' },
      { id: '5', horaInicio: '16:05', horaFin: '16:50', timeSlot: '16:05 - 16:50' },
      { id: '6', horaInicio: '16:55', horaFin: '17:35', timeSlot: '16:55 - 17:35' },
      { id: '7', horaInicio: '17:35', horaFin: '18:15', timeSlot: '17:35 - 18:15' },
      { id: '8', horaInicio: '18:15', horaFin: '19:00', timeSlot: '18:15 - 19:00' }
    ];
  }

  /**
   * Obtiene los días de la semana
   */
  public getDias(): DiaSemana[] {
    return Object.values(DiaSemana);
  }

  /**
   * Obtiene una celda específica
   */
  public getCelda(bloqueId: string, dia: DiaSemana): CeldaHorario | null {
    const horario = this.horarioActual();
    return horario.celdas.find(c => c.bloqueId === bloqueId && c.dia === dia) || null;
  }

  /**
   * Mueve una clase de una celda a otra
   */
  public moverClase(
    origenBloqueId: string,
    origenDia: DiaSemana,
    destinoBloqueId: string,
    destinoDia: DiaSemana
  ): boolean {
    console.log('🎯 Moviendo clase:', {
      desde: `${origenDia}-${origenBloqueId}`,
      hacia: `${destinoDia}-${destinoBloqueId}`
    });

    const horario = this.horarioActual();

    // Buscar celda origen
    const celdaOrigen = horario.celdas.find(c =>
      c.bloqueId === origenBloqueId && c.dia === origenDia
    );

    // Buscar celda destino
    const celdaDestino = horario.celdas.find(c =>
      c.bloqueId === destinoBloqueId && c.dia === destinoDia
    );

    // Validaciones detalladas
    if (!celdaOrigen) {
      console.log('❌ Celda origen no encontrada');
      return false;
    }

    if (!celdaDestino) {
      console.log('❌ Celda destino no encontrada');
      return false;
    }

    if (!celdaOrigen.clase) {
      console.log('❌ No hay clase en la celda origen');
      return false;
    }

    if (!celdaDestino.isEmpty) {
      console.log('❌ Celda destino ocupada');
      return false;
    }

    console.log('📋 Datos de la clase a mover:', {
      id: celdaOrigen.clase.id,
      nombre: celdaOrigen.clase.nombre,
      color: celdaOrigen.clase.color
    });

    // Realizar el movimiento
    celdaDestino.clase = { ...celdaOrigen.clase }; // Clonar el objeto
    celdaDestino.isEmpty = false;

    celdaOrigen.clase = null;
    celdaOrigen.isEmpty = true;

    // Actualizar fecha de modificación
    horario.fechaModificacion = new Date();

    // Actualizar estado reactivo
    this.horarioActual.set({ ...horario });

    // Guardar cambios
    this.guardarEnLocalStorage();
    this.guardarEnServidor();

    console.log('✅ Clase movida exitosamente');

    // Log especial para movimientos al miércoles
    if (destinoDia === DiaSemana.MIERCOLES) {
      console.log('🎉 Clase movida al miércoles - verificando estado...');
      const clasesMiercoles = horario.celdas.filter(c =>
        c.dia === DiaSemana.MIERCOLES && !c.isEmpty
      );
      console.log(`📅 Miércoles ahora tiene ${clasesMiercoles.length} clases`);
    }

    return true;
  }

  /**
   * Resetea el horario al estado inicial
   */
  public resetearHorario(): void {
    console.log('🔄 Reseteando horario al estado inicial...');

    // Limpiar localStorage
    this.limpiarLocalStorage();

    // Crear horario inicial limpio
    const horarioInicial = this.inicializarHorario();
    this.horarioActual.set(horarioInicial);

    // Guardar en localStorage
    this.guardarEnLocalStorage();

    // Eliminar del servidor y luego subir el nuevo
    this.httpService.eliminarHorarios().subscribe({
      next: () => {
        console.log('🗑️ Horarios eliminados del servidor');
        this.guardarEnServidor();
      },
      error: (error) => console.warn('⚠️ Error al eliminar del servidor:', error)
    });
  }

  /**
   * Verifica si localStorage está disponible (solo en el navegador)
   */
  private isLocalStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Guarda el horario en localStorage
   */
  private guardarEnLocalStorage(): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn('⚠️ localStorage no disponible');
      return;
    }

    try {
      const horario = this.horarioActual();
      const datosSerializados = JSON.stringify(horario);
      localStorage.setItem(this.STORAGE_KEY, datosSerializados);
      console.log('💾 Horario guardado en localStorage');
    } catch (error) {
      console.error('❌ Error al guardar en localStorage:', error);
    }
  }

  /**
   * Guarda el horario en el servidor
   */
  private guardarEnServidor(): void {
    const horario = this.horarioActual();
    this.httpService.guardarHorarios(horario).subscribe({
      next: (response) => {
        if (!response.error) {
          console.log('🌐 Horario sincronizado con el servidor');
        }
      },
      error: (error) => {
        console.warn('⚠️ No se pudo sincronizar con el servidor:', error);
      }
    });
  }

  /**
   * Carga el horario desde localStorage
   * @returns true si logró cargar datos, false si no hay datos o error
   */
  private cargarDesdeLocalStorage(): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const horario: HorarioSemanal = JSON.parse(data);

        console.log('🔍 Validando horario cargado desde localStorage...');

        // Validar que tenga la estructura correcta
        if (horario.profesor && horario.celdas && Array.isArray(horario.celdas)) {
          // Validación específica del miércoles
          const clasesMiercoles = horario.celdas.filter(c =>
            c.dia === DiaSemana.MIERCOLES && !c.isEmpty
          );

          // Verificar estructura de celdas
          const totalCeldas = horario.celdas.length;
          const celdasEsperadas = Object.values(DiaSemana).length * 9; // 5 días × 9 bloques

          console.log(`📊 Análisis de datos:`);
          console.log(`   - Total celdas: ${totalCeldas}/${celdasEsperadas}`);
          console.log(`   - Clases miércoles: ${clasesMiercoles.length}/3 esperadas`);

          // Log detallado del miércoles
          const miercolesCeldas = horario.celdas.filter(c => c.dia === DiaSemana.MIERCOLES);
          console.log(`📅 Estado del miércoles:`);
          miercolesCeldas.forEach(c => {
            if (!c.isEmpty) {
              console.log(`   ✅ Bloque ${c.bloqueId}: ${c.clase?.nombre || 'Sin nombre'}`);
            }
          });

          // Validación estricta
          if (clasesMiercoles.length >= 3 && totalCeldas === celdasEsperadas) {
            // Verificación adicional: que las clases del miércoles estén en los bloques correctos
            const miercoles6 = clasesMiercoles.find(c => c.bloqueId === '6');
            const miercoles7 = clasesMiercoles.find(c => c.bloqueId === '7');
            const miercoles8 = clasesMiercoles.find(c => c.bloqueId === '8');

            if (miercoles6 && miercoles7 && miercoles8) {
              this.horarioActual.set(horario);
              console.log('✅ Horario cargado correctamente desde localStorage');
              return true;
            } else {
              console.log('⚠️ Clases del miércoles no están en los bloques correctos (6°, 7°, 8°)');
            }
          } else {
            console.log('⚠️ Validación fallida - datos incompletos o corruptos');
          }
        } else {
          console.log('⚠️ Estructura de datos inválida');
        }
      }

      console.log('🔄 Datos no válidos - se usará horario inicial');
      return false;
    } catch (error) {
      console.error('❌ Error al cargar desde localStorage:', error);
      return false;
    }
  }

  /**
   * Limpia los datos de localStorage
   */
  private limpiarLocalStorage(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(this.STORAGE_KEY);
      // También limpiar versiones anteriores por si acaso
      localStorage.removeItem('horario-docente-pablo-sayanes-final');
      localStorage.removeItem('horario-docente-pablo-sayanes-v3');
      localStorage.removeItem('horario-docente-pablo-sayanes-v2');
      localStorage.removeItem('horario-docente-pablo-sayanes');
      console.log('🗑️ localStorage limpiado');
    }
  }
}
