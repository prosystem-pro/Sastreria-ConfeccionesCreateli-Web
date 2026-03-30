import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { HeaderComponent } from './Componentes/header/header.component';
import { FooterComponent } from './Componentes/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpinnerGlobalComponent } from './Componentes/spinner-global/spinner-global.component'; // 👈 agregar

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, FormsModule, CommonModule, SpinnerGlobalComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(public Router: Router) { }

  CentrarContenido = false;

  OnRouteActivate(component: any) {
    this.CentrarContenido = component.CentrarVertical ?? false;
  }
}