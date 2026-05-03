import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ReporteServicio } from '../../../../Servicios/ReporteServicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';


@Component({
  selector: 'app-reporte-pedido-anexo',
  imports: [FormsModule, CommonModule, SpinnerGlobalComponent],
  templateUrl: './reporte-pedido-anexo.component.html',
  styleUrl: './reporte-pedido-anexo.component.css'
})
export class ReportePedidoAnexoComponent implements OnInit {
  @ViewChild('dateInicio') dateInicio!: ElementRef<HTMLInputElement>;
  @ViewChild('dateFin') dateFin!: ElementRef<HTMLInputElement>;
  FechaInicioFormateada: string = '';
  FechaFinFormateada: string = '';
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
    this.SetearFechasMesActual();
    this.CargarReporte();
  }
  SetearFechasMesActual() {

    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const fin = hoy;

    this.FechaInicio = this.FormatoInput(inicio);
    this.FechaFin = this.FormatoInput(fin);

    this.FechaInicioFormateada = this.FormatearFecha(this.FechaInicio);
    this.FechaFinFormateada = this.FormatearFecha(this.FechaFin);
  }
  FormatoInput(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }
  CargarReporte() {

    this.cargando = true;

    this.reporteServicio.ReportePedidosAnexo(
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

  Limpiar() {

    this.FechaInicio = '';
    this.FechaFin = '';

    this.CargarReporte();
  }

  IrARuta(ruta: string) {
    this.Router.navigate([ruta]);
  }
}
