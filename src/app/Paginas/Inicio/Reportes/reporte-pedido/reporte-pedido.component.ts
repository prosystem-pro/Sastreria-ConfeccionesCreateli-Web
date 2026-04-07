import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ReporteServicio } from '../../../../Servicios/ReporteServicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';


@Component({
  selector: 'app-reporte-pedido',
  imports: [FormsModule, CommonModule, SpinnerGlobalComponent],
  templateUrl: './reporte-pedido.component.html',
  styleUrl: './reporte-pedido.component.css'
})
export class ReportePedidoComponent implements OnInit {
  rutaActual = '';
  FechaInicio: string = '';
  FechaFin: string = '';

  cargando: boolean = false;

  reporte: any = {
    TotalPedidos: 0,
    MontoPedidos: 0,
    TotalAbono: 0,
    SaldoPendiente: 0
  };

  constructor(
    private reporteServicio: ReporteServicio,
    private Router: Router
  ) { }

  ngOnInit(): void {
    this.rutaActual = this.Router.url;
    this.CargarReporte();
  }

  CargarReporte() {

    this.cargando = true;

    this.reporteServicio.ReportePedidos(
      this.FechaInicio,
      this.FechaFin
    ).subscribe({

      next: (resp) => {

        this.reporte = resp.data;
        this.cargando = false;

      },

      error: (err) => {

        console.error(err);
        this.cargando = false;

      }

    });
  }

  Buscar() {
    this.CargarReporte();
  }

  Limpiar() {

    this.FechaInicio = '';
    this.FechaFin = '';

    this.CargarReporte();
  }

  IrARuta(ruta: string) {
    this.Router.navigate([ruta]);
  }
}
