import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HorarioSemanal } from '../models/horario.model';

@Injectable({
  providedIn: 'root'
})
export class HorarioHttpService {
  private readonly BASE_URL = 'http://localhost:3001/api';
  private readonly http = inject(HttpClient);

  /**
   * Carga horarios desde el servidor
   */
  cargarHorarios(): Observable<HorarioSemanal | null> {
    return this.http.get<HorarioSemanal>(`${this.BASE_URL}/horarios`).pipe(
      catchError(error => {
        if (error.status === 404) {
          console.log('ℹ️ No hay horarios guardados en el servidor');
        } else {
          console.error('❌ Error al cargar horarios del servidor:', error);
        }
        return of(null);
      })
    );
  }

  /**
   * Guarda horarios en el servidor
   */
  guardarHorarios(horario: HorarioSemanal): Observable<any> {
    return this.http.post(`${this.BASE_URL}/horarios`, horario).pipe(
      catchError(error => {
        console.error('❌ Error al guardar horarios en el servidor:', error);
        return of({ error: true });
      })
    );
  }

  /**
   * Elimina horarios del servidor (para reset)
   */
  eliminarHorarios(): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/horarios`).pipe(
      catchError(error => {
        console.error('❌ Error al eliminar horarios del servidor:', error);
        return of({ error: true });
      })
    );
  }

  /**
   * Verifica si el servidor está disponible
   */
  verificarConexion(): Observable<boolean> {
    return this.http.get(`${this.BASE_URL}/health`).pipe(
      catchError(() => {
        // Si hay error, el servidor no está disponible
        return of(false);
      }),
      // Si llegamos aquí, la petición fue exitosa
      // Convertimos cualquier respuesta a true
      map(() => true)
    );
  }
}
