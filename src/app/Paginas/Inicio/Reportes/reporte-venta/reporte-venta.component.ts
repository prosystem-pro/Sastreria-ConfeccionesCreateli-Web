import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReporteServicio } from '../../../../Servicios/ReporteServicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-reporte-venta',
  imports: [CommonModule, FormsModule, SpinnerGlobalComponent],
  templateUrl: './reporte-venta.component.html',
  styleUrl: './reporte-venta.component.css'
})
export class ReporteVentaComponent {
  @ViewChild('dateInicio') dateInicio!: ElementRef<HTMLInputElement>;
  @ViewChild('dateFin') dateFin!: ElementRef<HTMLInputElement>;
  FechaInicioFormateada: string = '';
  FechaFinFormateada: string = '';
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
  AbrirDatePicker(tipo: 'inicio' | 'fin') {
    if (tipo === 'inicio') {
      this.dateInicio.nativeElement.showPicker();
    } else {
      this.dateFin.nativeElement.showPicker();
    }
  }
  OnFechaInicioChange() {
    this.FechaInicioFormateada = this.FormatearFecha(this.FechaInicio);
  }

  OnFechaFinChange() {
    this.FechaFinFormateada = this.FormatearFecha(this.FechaFin);
  }
  FormatearFecha(fecha: string): string {
    if (!fecha) return '';

    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
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
