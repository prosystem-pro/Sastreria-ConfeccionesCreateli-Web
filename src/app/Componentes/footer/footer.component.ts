import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  imports: [NgIf, FormsModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  constructor(private Router: Router) { }


  EsLogin(): boolean {
    return this.Router.url === '/login';
  }

  EsMenu(): boolean {
    return this.Router.url === '/menu';
  }

  EsCliente(): boolean {
    return this.Router.url === '/cliente';
  }

  EsGestionClienteCodigo(): boolean {
    return this.Router.url.startsWith('/gestion-cliente/');
  }
  EsGestionCliente(): boolean {
    return this.Router.url === '/gestion-cliente';
  }
  IrARuta(ruta: string) {
    this.Router.navigate([ruta]);
  }
}
