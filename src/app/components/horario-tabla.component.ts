import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { HorarioService } from '../services/horario.service';
import { DiaSemana, CeldaHorario, BloqueHorario } from '../models/horario.model';

@Component({
  selector: 'app-horario-tabla',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="horario-container">
      <!-- Header con título y botón reset -->
      <div class="header">
        <div class="titulo-section">
          <h1>{{ horarioService.horarioActual().profesor }}</h1>
          <p class="subtitle">Horario Semanal de Clases</p>
        </div>
        <button
          class="btn-reset"
          (click)="resetearHorario()"
          title="Restaurar horario inicial">
          🔄 Resetear Horario
        </button>
      </div>

      <!-- Tabla de horarios -->
      <div class="tabla-horarios">
        <table>
          <!-- Encabezado con días de la semana -->
          <thead>
            <tr>
              <th class="horario-column">Horario</th>
              <th *ngFor="let dia of dias" class="dia-column">{{ dia }}</th>
            </tr>
          </thead>

          <!-- Cuerpo de la tabla -->
          <tbody>
            <tr *ngFor="let bloque of bloques; trackBy: trackByBloqueId">
              <!-- Columna de horario -->
              <td class="horario-cell">
                <div class="horario-info">
                  <span class="bloque-numero">{{ getNumeroBloque(bloque.id) }}°</span>
                  <span class="tiempo">{{ bloque.timeSlot }}</span>
                </div>
              </td>

                            <!-- Celdas de cada día -->
              <td
                *ngFor="let dia of dias; trackBy: trackByDia"
                class="celda-horario"
                [class.celda-vacia]="esCeldaVacia(bloque.id, dia)"
                [class.celda-ocupada]="!esCeldaVacia(bloque.id, dia)"
                cdkDropList
                [id]="'drop-' + bloque.id + '-' + dia"
                [cdkDropListData]="getCeldaData(bloque.id, dia)"
                [cdkDropListConnectedTo]="getAllDropIds()"
                (cdkDropListDropped)="onDrop($event, bloque.id, dia)">

                <!-- Clase arrastrable si existe -->
                <div
                  *ngIf="!esCeldaVacia(bloque.id, dia)"
                  class="clase-item"
                  [style.background-color]="getClaseColor(bloque.id, dia)"
                  cdkDrag
                  [cdkDragData]="getClaseData(bloque.id, dia)">

                  <div class="clase-contenido">
                    <span class="grado-seccion">
                      {{ getClaseTexto(bloque.id, dia) }}
                    </span>
                  </div>

                  <!-- Preview mientras se arrastra -->
                  <div class="drag-preview" *cdkDragPreview>
                    <div
                      class="preview-item"
                      [style.background-color]="getClaseColor(bloque.id, dia)">
                      {{ getClaseTexto(bloque.id, dia) }}
                    </div>
                  </div>
                </div>

                <!-- Placeholder para celdas vacías durante drag -->
                <div
                  class="drop-placeholder"
                  *cdkDragPlaceholder>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer con información -->
      <div class="footer">
        <p class="info-text">
          📋 Arrastra las clases para reorganizar tu horario
        </p>
        <p class="info-text">
          💾 Los cambios se guardan automáticamente
        </p>
        <p class="ultima-modificacion">
          Última modificación: {{ getFechaModificacion() }}
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./horario-tabla.component.scss']
})
export class HorarioTablaComponent {
  // Inyección del servicio
  public horarioService = inject(HorarioService);

  // Datos para la vista
  public dias: DiaSemana[] = [];
  public bloques: BloqueHorario[] = [];

  constructor() {
    this.dias = this.horarioService.getDias();
    this.bloques = this.horarioService.getBloques();
  }

  /**
   * Función de tracking para ngFor de bloques
   */
  trackByBloqueId(index: number, bloque: BloqueHorario): string {
    return bloque.id;
  }

  /**
   * Función de tracking para ngFor de días
   */
  trackByDia(index: number, dia: DiaSemana): string {
    return dia;
  }

  /**
   * Verifica si una celda está vacía
   */
  esCeldaVacia(bloqueId: string, dia: DiaSemana): boolean {
    const celda = this.horarioService.getCelda(bloqueId, dia);
    return celda ? celda.isEmpty : true;
  }

  /**
   * Obtiene el color de una clase
   */
  getClaseColor(bloqueId: string, dia: DiaSemana): string {
    const celda = this.horarioService.getCelda(bloqueId, dia);
    return celda?.clase?.color || '#f8f9fa';
  }

  /**
   * Obtiene el texto de una clase (nombre completo o grado + sección)
   */
  getClaseTexto(bloqueId: string, dia: DiaSemana): string {
    const celda = this.horarioService.getCelda(bloqueId, dia);
    if (celda?.clase) {
      // Priorizar 'nombre' si viene del backend, sino usar grado + seccion
      if (celda.clase.nombre) {
        return celda.clase.nombre;
      } else if (celda.clase.grado && celda.clase.seccion) {
        return `${celda.clase.grado}${celda.clase.seccion}`;
      }
    }
    return '';
  }

  /**
   * Obtiene los datos de una celda para drag & drop
   */
  getCeldaData(bloqueId: string, dia: DiaSemana): any {
    return { bloqueId, dia };
  }

  /**
   * Obtiene los datos de una clase para drag & drop
   */
  getClaseData(bloqueId: string, dia: DiaSemana): any {
    const celda = this.horarioService.getCelda(bloqueId, dia);
    return {
      clase: celda?.clase,
      origenBloqueId: bloqueId,
      origenDia: dia
    };
  }

  /**
   * Obtiene el número del bloque (0° -> 0°, 1° -> 1°, etc.)
   */
  getNumeroBloque(bloqueId: string): number {
    return parseInt(bloqueId);
  }

  /**
   * Genera todas las IDs de drop para conectar las zonas de drop entre sí
   */
  getAllDropIds(): string[] {
    const dropIds: string[] = [];
    this.bloques.forEach(bloque => {
      this.dias.forEach(dia => {
        dropIds.push(`drop-${bloque.id}-${dia}`);
      });
    });
    return dropIds;
  }

    /**
   * Maneja el evento de drop
   */
  onDrop(event: CdkDragDrop<any>, destinoBloqueId: string, destinoDia: DiaSemana): void {
    console.log('🎯 Drop detectado:', {
      sameContainer: event.previousContainer === event.container,
      dragData: event.item.data,
      destino: `${destinoDia}-${destinoBloqueId}`
    });

    // Si el drop ocurre en la misma lista, no hacer nada
    if (event.previousContainer === event.container) {
      console.log('📍 Drop en la misma celda, ignorando');
      return;
    }

    // Obtener datos del drag
    const dragData = event.item.data;

    if (!dragData || !dragData.clase) {
      console.log('❌ No hay datos válidos para el drag');
      return;
    }

    const { origenBloqueId, origenDia } = dragData;

    console.log('🔄 Intentando mover clase:', {
      clase: dragData.clase.nombre,
      desde: `${origenDia}-${origenBloqueId}`,
      hacia: `${destinoDia}-${destinoBloqueId}`
    });

    // Verificar que la celda destino esté vacía
    if (!this.esCeldaVacia(destinoBloqueId, destinoDia)) {
      console.log('⚠️ Celda destino ocupada');
      this.mostrarErrorMovimiento();
      return;
    }

    // Intentar mover la clase
    const movimientoExitoso = this.horarioService.moverClase(
      origenBloqueId,
      origenDia,
      destinoBloqueId,
      destinoDia
    );

    if (movimientoExitoso) {
      console.log('✅ Clase movida exitosamente');
    } else {
      console.log('❌ Error al mover la clase');
      this.mostrarErrorMovimiento();
    }
  }

  /**
   * Resetea el horario al estado inicial
   */
  resetearHorario(): void {
    if (confirm('¿Estás seguro de que quieres resetear el horario al estado inicial? Esto eliminará todos los cambios que hayas hecho.')) {
      this.horarioService.resetearHorario();
      console.log('🔄 Horario reseteado al estado inicial');
    }
  }

  /**
   * Obtiene la fecha de última modificación formateada
   */
  getFechaModificacion(): string {
    const fecha = this.horarioService.horarioActual().fechaModificacion;
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Muestra feedback de error en movimiento (opcional)
   */
  private mostrarErrorMovimiento(): void {
    // Implementar notificación visual si se desea
    console.log('No se puede mover a una celda ocupada');
  }
}
