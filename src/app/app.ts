import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HorarioTablaComponent } from './components/horario-tabla.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HorarioTablaComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'horarios-docente';
}
