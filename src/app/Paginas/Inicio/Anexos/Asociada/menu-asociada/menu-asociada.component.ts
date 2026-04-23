import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-asociada',
  imports: [CommonModule],
  templateUrl: './menu-asociada.component.html',
  styleUrl: './menu-asociada.component.css'
})
export class MenuAsociadaComponent {
  
  hover: string = '';

  constructor(
    private Router: Router,
  ) { }

  IrARuta(ruta: string) {
    this.Router.navigate([ruta]);
  }

}
