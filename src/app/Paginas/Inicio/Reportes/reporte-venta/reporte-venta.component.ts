import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReporteServicio } from '../../../../Servicios/ReporteServicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';

@Component({
  selector: 'app-reporte-venta',
  imports: [CommonModule, FormsModule, SpinnerGlobalComponent],
  templateUrl: './reporte-venta.component.html',
  styleUrl: './reporte-venta.component.css'
})
export class ReporteVentaComponent {
  rutaActual = '';
  FechaInicio: string = '';
  FechaFin: string = '';

  cargando: boolean = false;

  reporte: any = {
    TotalVentas: 0,
    TotalTransacciones: 0,
    MontoTotal: 0
  };

  constructor(
    private reporteServicio: ReporteServicio, private Router: Router,
  ) { }

  ngOnInit(): void {
    this.rutaActual = this.Router.url;
    this.CargarReporte();
  }

  CargarReporte() {

    this.cargando = true;

    this.reporteServicio.ReporteVentas(
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
