import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  CentrarVertical = true;
  opciones = [
    { nombre: 'Clientes', icono: 'bi-people-fill', ruta: '/cliente' },
    { nombre: 'Pedidos', icono: 'bi-bag-fill', ruta: '/pedido-listado' },
    { nombre: 'Historial de Pedidos', icono: 'bi-clock-history', ruta: '/pedido-historial-listado' },
    { nombre: 'Inventario', icono: 'bi-box-seam', ruta: '/inventario-listado' },
    { nombre: 'Ventas', icono: 'bi-cash-stack', ruta: '/venta-listado' },
    { nombre: 'Anexos', icono: 'bi-paperclip', ruta: '/anexos' },
    { nombre: 'Reportes', icono: 'bi-bar-chart-fill', ruta: '/reportes' },
    { nombre: 'Configuración', icono: 'bi-gear-fill', ruta: '/configuracion-listado' }
  ];


}
