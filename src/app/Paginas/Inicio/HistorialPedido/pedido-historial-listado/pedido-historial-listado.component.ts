import { Component, OnInit } from '@angular/core';
import { HistorialPedidoServicio } from '../../../../Servicios/HistorialPedidoServicio';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginServicio } from '../../../../Servicios/LoginServicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-pedido-historial-listado',
  imports: [CommonModule, FormsModule, SpinnerGlobalComponent],
  templateUrl: './pedido-historial-listado.component.html',
  styleUrl: './pedido-historial-listado.component.css'
})
export class PedidoHistorialListadoComponent implements OnInit {
  @ViewChild('dateInicio') dateInicio!: ElementRef;
  @ViewChild('dateFin') dateFin!: ElementRef;

  FechaInicioFormateada: string = '';
  FechaFinFormateada: string = '';
  VerOtros: boolean = false;
  Procesando = false;
  FechaInicio: string = '';
  FechaFin: string = '';
  Roles: string | null = null;
  Rol: string | null = null;
  SuperAdmin: number | null = null;

  PedidosOriginal: any[] = [];
  PedidosFiltrados: any[] = [];

  Busqueda: string = '';
  CampoOrden: string = 'NombreCliente';
  Orden: 'asc' | 'desc' = 'asc';

  Cargando: boolean = false;
  Error: string = '';

  constructor(
    private HistorialPedidoServicio: HistorialPedidoServicio,
    private Router: Router,
    private route: ActivatedRoute,
    private LoginServicio: LoginServicio
  ) { }

  ngOnInit(): void {
    this.Rol = this.LoginServicio.ObtenerRol();
    const payload = this.LoginServicio.ObtenerPayloadToken();
    this.Rol = payload?.NombreRol || null;
    this.SuperAdmin = payload?.SuperAdmin || null;

    this.VerOtros = this.route.snapshot.queryParamMap.get('verOtros') === 'true';

    this.CargarEntregados();
  }

  // ------------------- CARGA -------------------
  CargarEntregados() {

    this.Procesando = true;
    this.Cargando = true;
    this.Error = '';

    this.HistorialPedidoServicio.ListadoEntregados(this.VerOtros)
      .subscribe({

        next: (Respuesta: any) => {

          this.PedidosOriginal = Respuesta.data || [];
          this.FiltrarPedidos();

          this.Cargando = false;
          this.Procesando = false;

        },

        error: () => {

          this.Error = 'Error al cargar el historial de pedidos.';
          this.Cargando = false;
          this.Procesando = false;

        }

      });

  }

  // ------------------- FILTROS -------------------
  // FiltrarPedidos() {

  //   this.PedidosFiltrados = this.PedidosOriginal
  //     .filter(p => {

  //       const coincideBusqueda =
  //         p.NombreCliente?.toLowerCase().includes(this.Busqueda.toLowerCase());

  //       const fechaPedido = new Date(p.FechaCreacion);

  //       const cumpleInicio =
  //         !this.FechaInicio || fechaPedido >= new Date(this.FechaInicio);

  //       const cumpleFin =
  //         !this.FechaFin || fechaPedido <= new Date(this.FechaFin);

  //       return coincideBusqueda && cumpleInicio && cumpleFin;

  //     })
  //     .sort((a, b) => {

  //       let valorA = a[this.CampoOrden];
  //       let valorB = b[this.CampoOrden];

  //       if (this.CampoOrden === 'NombreCliente') {
  //         valorA = valorA?.toLowerCase() || '';
  //         valorB = valorB?.toLowerCase() || '';
  //       }

  //       if (valorA > valorB) return this.Orden === 'asc' ? 1 : -1;
  //       if (valorA < valorB) return this.Orden === 'asc' ? -1 : 1;
  //       return 0;

  //     });

  // }
  FiltrarPedidos() {

    this.PedidosFiltrados = this.PedidosOriginal
      .filter(p => {

        const coincideBusqueda =
          p.NombreCliente?.toLowerCase().includes(this.Busqueda.toLowerCase());

        const [fecha] = (p.FechaCreacion || '').split(' ');
        const [dia, mes, anio] = (fecha || '').split('/');

        const fechaPedido = new Date(
          Number(anio),
          Number(mes) - 1,
          Number(dia)
        );

        const fechaInicio = this.FechaInicio
          ? new Date(this.FechaInicio + 'T00:00:00')
          : null;

        const fechaFin = this.FechaFin
          ? new Date(this.FechaFin + 'T00:00:00')
          : null;

        const cumpleInicio =
          !fechaInicio || fechaPedido >= fechaInicio;

        const cumpleFin =
          !fechaFin || fechaPedido <= fechaFin;

        return coincideBusqueda && cumpleInicio && cumpleFin;

      })
      .sort((a, b) => {

        let valorA = a[this.CampoOrden];
        let valorB = b[this.CampoOrden];

        if (this.CampoOrden === 'NombreCliente') {
          valorA = valorA?.toLowerCase() || '';
          valorB = valorB?.toLowerCase() || '';
        }

        if (valorA > valorB) return this.Orden === 'asc' ? 1 : -1;
        if (valorA < valorB) return this.Orden === 'asc' ? -1 : 1;
        return 0;

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
    this.FiltrarPedidos();
  }

  OnFechaFinChange() {
    this.FechaFinFormateada = this.FormatearFecha(this.FechaFin);
    this.FiltrarPedidos();
  }

  FormatearFecha(fecha: string): string {
    if (!fecha) return '';

    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  // ------------------- ORDEN -------------------
  OrdenarPor(campo: string) {

    if (this.CampoOrden === campo) {
      this.Orden = this.Orden === 'asc' ? 'desc' : 'asc';
    } else {
      this.CampoOrden = campo;
      this.Orden = 'asc';
    }

    this.FiltrarPedidos();
  }

  ObtenerIconoOrden(campo: string) {

    if (this.CampoOrden !== campo) {
      return 'bi-arrow-down-up';
    }

    return this.Orden === 'asc'
      ? 'bi-sort-up'
      : 'bi-sort-down';
  }

  // ------------------- RUTAS -------------------
  IrARuta(Ruta: string) {

    const verOtros = this.route.snapshot.queryParamMap.get('verOtros');

    this.Router.navigate([Ruta], {
      queryParams: verOtros === 'true' ? { verOtros: 'true' } : {}
    });

  }
  DescargarPDF(CodigoPedido: number) {
    this.Procesando = true;
    this.HistorialPedidoServicio.DescargarPDFPedido(CodigoPedido).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pedido_${CodigoPedido}.pdf`;
        document.body.appendChild(a); // necesario en algunos navegadores
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url); // liberar memoria
        this.Procesando = false;
      },
      error: (err) => {
        console.error('Error al descargar PDF', err);
        this.Procesando = false;
      }
    });
  }
  IrAHistorial(Codigo: number) {
    this.Router.navigate(
      ['/pedido-historial', Codigo],
      {
        queryParams: {
          verOtros: this.VerOtros
        }
      }
    );
  }
  ObtenerRutaMenu(): string {

    const verOtros = this.route.snapshot.queryParamMap.get('verOtros') === 'true';

    if (verOtros) {
      return '/menu-oficial';
    }

    if (this.Rol === 'EMPRESA_OFICIAL') {
      return '/menu';
    }

    if (this.Rol === 'EMPRESA_ASOCIADA') {
      return '/menu-asociada';
    }

    return '/login';
  }
  EsSuperAdmin(): boolean {
    return this.SuperAdmin === 1;
  }

  EsOficial(): boolean {
    return this.Rol === 'EMPRESA_OFICIAL';
  }

  EsAsociada(): boolean {
    return this.Rol === 'EMPRESA_ASOCIADA';
  }
}
