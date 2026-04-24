import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-oficial',
  imports: [],
  templateUrl: './menu-oficial.component.html',
  styleUrl: './menu-oficial.component.css'
})
export class MenuOficialComponent {

  constructor(
    private Router: Router,
  ) { }

IrARuta(ruta: string, verOtros: boolean = false) {
  this.Router.navigate([ruta], {
    queryParams: verOtros ? { verOtros: true } : {}
  });
}
}
