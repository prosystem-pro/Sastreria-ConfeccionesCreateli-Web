import { Component } from '@angular/core';
import { VentaServicio } from '../../../../Servicios/VentaServicio';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-venta-listado',
  imports: [CommonModule, FormsModule, SpinnerGlobalComponent],
  templateUrl: './venta-listado.component.html',
  styleUrl: './venta-listado.component.css'
})
export class VentaListadoComponent {
  @ViewChild('dateInicio') dateInicio!: ElementRef;
  @ViewChild('dateFin') dateFin!: ElementRef;
  FechaInicioFormateada: string = '';
  FechaFinFormateada: string = '';
  Procesando = false;
  FechaInicio: string = '';
  FechaFin: string = '';

  VentasOriginal: any[] = [];
  VentasFiltradas: any[] = [];

  Busqueda: string = '';
  CampoOrden: string = 'NombreCliente';
  Orden: 'asc' | 'desc' = 'asc';

  Cargando: boolean = false;
  Error: string = '';

  constructor(
    private VentaServicio: VentaServicio,
    private Router: Router,
    private AlertaServicio: AlertaServicio
  ) { }


  ngOnInit(): void {

    const hoy = new Date();

    const anio = hoy.getFullYear();

    const mes = String(
      hoy.getMonth() + 1
    ).padStart(2, '0');

    const dia = String(
      hoy.getDate()
    ).padStart(2, '0');

    // ================= RANGO DEL MES =================
    const primerDiaMes =
      `${anio}-${mes}-01`;

    const fechaActual =
      `${anio}-${mes}-${dia}`;

    // ================= FECHAS =================
    this.FechaInicio = primerDiaMes;

    this.FechaFin = fechaActual;

    // ================= TEXTO VISIBLE =================
    this.FechaInicioFormateada =
      this.FormatearFecha(this.FechaInicio);

    this.FechaFinFormateada =
      this.FormatearFecha(this.FechaFin);

    this.CargarVentas();
  }
  // ------------------- ARRASTRE PARA ELIMINAR -------------------
  IniciarArrastre(event: any, index: number) {

    const startX = event.type.startsWith('touch')
      ? event.touches[0].clientX
      : event.clientX;

    const startY = event.type.startsWith('touch')
      ? event.touches[0].clientY
      : event.clientY;

    const content = event.currentTarget;

    let isHorizontal = false; // 👈 clave
    let activado = false;

    const mover = (moveEvent: any) => {

      const clientX = moveEvent.type.startsWith('touch')
        ? moveEvent.touches[0].clientX
        : moveEvent.clientX;

      const clientY = moveEvent.type.startsWith('touch')
        ? moveEvent.touches[0].clientY
        : moveEvent.clientY;

      const dx = clientX - startX;
      const dy = clientY - startY;

      // 🔥 1. decidir dirección SOLO una vez
      if (!activado) {

        if (Math.abs(dy) > Math.abs(dx)) {
          // 👉 es scroll vertical, ignorar swipe
          isHorizontal = false;
          return;
        }

        // 👉 es swipe horizontal
        isHorizontal = true;
        activado = true;
      }

      if (!isHorizontal) return;

      let moveX = dx;
      if (moveX < 0) moveX = 0;
      if (moveX > 80) moveX = 80;

      content.style.transform = `translateX(${moveX}px)`;
    };

    const soltar = () => {

      const transformX =
        parseInt(content.style.transform.replace('translateX(', '').replace('px)', '')) || 0;

      content.style.transform = `translateX(0)`;

      if (isHorizontal && transformX > 60) {

        const venta = this.VentasFiltradas[index];

        this.AlertaServicio.Confirmacion(
          'Confirmar eliminación',
          `¿Desea eliminar la venta de "${venta.NombreCliente}"?`,
          'Eliminar',
          'Cancelar'
        ).then(confirmed => {

          if (confirmed) {
            this.ConfirmarEliminar(venta.CodigoPedido);
          }

        });

      }

      window.removeEventListener('mousemove', mover);
      window.removeEventListener('mouseup', soltar);
      window.removeEventListener('touchmove', mover);
      window.removeEventListener('touchend', soltar);
    };

    window.addEventListener('mousemove', mover);
    window.addEventListener('mouseup', soltar);
    window.addEventListener('touchmove', mover, { passive: true });
    window.addEventListener('touchend', soltar);
  }
  // ------------------- ELIMINAR VENTA -------------------
  ConfirmarEliminar(CodigoPedido: number) {

    this.Procesando = true;

    this.VentaServicio.EliminarVenta(CodigoPedido)
      .subscribe({

        next: (resp) => {

          this.AlertaServicio.MostrarExito(
            'Venta eliminada',
            resp.message || 'La venta fue eliminada correctamente'
          );

          this.CargarVentas();

        },

        error: (err) => {

          this.Procesando = false;

          this.AlertaServicio.MostrarError(
            'Error',
            err.error?.message || 'No se pudo eliminar la venta'
          );

        }

      });

  }
  // ------------------- CARGA -------------------
  CargarVentas() {
    this.Procesando = true;
    this.Cargando = true;
    this.Error = '';

    this.VentaServicio.ListadoVentas(this.FechaInicio,
      this.FechaFin).subscribe({
        next: (Respuesta: {

          data: Array<{
            CodigoPedido: number;
            Fecha: string;
            Total: number;
            Cliente: string;
            Usuario: string;
            Pagos: Array<{ MontoAplicado: number; MontoPago: number }>;
          }>

        }) => {
          // Aquí tipamos 'v' inline
          this.VentasOriginal = (Respuesta.data || []).map((v: {
            CodigoPedido: number;
            Fecha: string;
            Total: number;
            Cliente: string;
            Usuario: string;
            Pagos: Array<{ MontoAplicado: number; MontoPago: number }>;
          }) => ({
            CodigoPedido: v.CodigoPedido,
            FechaCreacion: v.Fecha,
            Total: v.Total,
            NombreCliente: v.Cliente,
            Usuario: v.Usuario,
            Pagos: v.Pagos
          }));
          this.FiltrarVentas();
          this.Cargando = false;
          this.Procesando = false;
        },
        error: () => {
          this.Error = 'Error al cargar el listado de ventas.';
          this.Cargando = false;
          this.Procesando = false;
        }
      });
  }
  // ------------------- FILTROS -------------------
  // FiltrarVentas() {
  //   this.VentasFiltradas = this.VentasOriginal
  //     .filter(v => {
  //       const coincideBusqueda =
  //         v.NombreCliente?.toLowerCase().includes(this.Busqueda.toLowerCase());

  //       const fechaVenta = new Date(v.FechaCreacion);
  //       const cumpleInicio = !this.FechaInicio || fechaVenta >= new Date(this.FechaInicio);
  //       const cumpleFin = !this.FechaFin || fechaVenta <= new Date(this.FechaFin);

  //       return coincideBusqueda && cumpleInicio && cumpleFin;
  //     })
  //     .sort((a, b) => {
  //       let valorA = a[this.CampoOrden];
  //       let valorB = b[this.CampoOrden];

  //       if (this.CampoOrden === 'NombreCliente' || this.CampoOrden === 'Usuario') {
  //         valorA = valorA?.toLowerCase() || '';
  //         valorB = valorB?.toLowerCase() || '';
  //       }

  //       if (valorA > valorB) return this.Orden === 'asc' ? 1 : -1;
  //       if (valorA < valorB) return this.Orden === 'asc' ? -1 : 1;
  //       return 0;
  //     });
  // }
  FiltrarVentas() {

    this.VentasFiltradas = this.VentasOriginal
      .filter(v => {

        return v.NombreCliente
          ?.toLowerCase()
          .includes(
            this.Busqueda.toLowerCase()
          );

      })
      .sort((a, b) => {

        let valorA = a[this.CampoOrden];
        let valorB = b[this.CampoOrden];

        if (
          this.CampoOrden === 'NombreCliente' ||
          this.CampoOrden === 'Usuario'
        ) {

          valorA = valorA?.toLowerCase() || '';
          valorB = valorB?.toLowerCase() || '';
        }

        if (valorA > valorB)
          return this.Orden === 'asc' ? 1 : -1;

        if (valorA < valorB)
          return this.Orden === 'asc' ? -1 : 1;

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
  FormatearFecha(fecha: string): string {
    if (!fecha) return '';

    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }
  OnFechaInicioChange() {

    this.FechaInicioFormateada =
      this.FormatearFecha(this.FechaInicio);

    this.CargarVentas();
  }

  OnFechaFinChange() {

    this.FechaFinFormateada =
      this.FormatearFecha(this.FechaFin);

    this.CargarVentas();
  }

  // ------------------- ORDEN -------------------
  OrdenarPor(campo: string) {
    if (this.CampoOrden === campo) {
      this.Orden = this.Orden === 'asc' ? 'desc' : 'asc';
    } else {
      this.CampoOrden = campo;
      this.Orden = 'asc';
    }
    this.FiltrarVentas();
  }

  ObtenerIconoOrden(campo: string) {
    if (this.CampoOrden !== campo) return 'bi-arrow-down-up';
    return this.Orden === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
  }

  // ------------------- RUTAS -------------------
  IrARuta(Ruta: string) {
    this.Router.navigate([Ruta]);
  }

  IrADetalle(Codigo: number) {
    this.Router.navigate(['/venta-detalle', Codigo]);
  }
  IrAVentaImpresion(codigoPedido: number) {

    this.Router.navigate(['/venta-impresion', codigoPedido], {
      queryParams: {
        origen: 'venta'
      }
    });

  }
  DescargarPDF(CodigoPedido: number) {

    this.Procesando = true;

    this.VentaServicio
      .GenerarPDFVenta(CodigoPedido)
      .subscribe({

        next: (response: Blob) => {
          const blob = new Blob(
            [response],
            { type: 'application/pdf' }
          );

          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `venta_${CodigoPedido}.pdf`;
          a.click();

          window.URL.revokeObjectURL(url);

          this.Procesando = false;
        },

        error: (error) => {

          this.Procesando = false;

          this.AlertaServicio.MostrarError(
            'Error al descargar PDF'
          );

          console.error(error);
        }

      });
  }

}
