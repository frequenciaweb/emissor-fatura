import { Component } from '@angular/core';
import { FaturaComponent } from './paginas/fatura/fatura.component';

@Component({
  selector: 'app-root',
  imports: [FaturaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'emissor-fatura';
}
