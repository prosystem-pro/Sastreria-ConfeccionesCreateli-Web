import { Component, ViewChild, ElementRef } from '@angular/core';
import { VentaServicio } from '../../../../Servicios/VentaServicio';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';


@Component({
  selector: 'app-venta-listado',
  imports: [CommonModule, FormsModule, SpinnerGlobalComponent],
  templateUrl: './venta-listado.component.html',
  styleUrl: './venta-listado.component.css'
})
export class VentaListadoComponent {
  @ViewChild('areaImpresion') areaImpresion!: ElementRef<HTMLElement>;
  datosImpresion: any;
  ProcesandoImpresion = false;
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
    this.CargarVentas();
  }
  // ------------------- ARRASTRE PARA ELIMINAR -------------------
  IniciarArrastre(event: any, index: number) {

    event.preventDefault();

    const startX = event.type.startsWith('touch')
      ? event.touches[0].clientX
      : event.clientX;

    const content = event.currentTarget;

    const mover = (moveEvent: any) => {

      const clientX = moveEvent.type.startsWith('touch')
        ? moveEvent.touches[0].clientX
        : moveEvent.clientX;

      let dx = clientX - startX;

      if (dx < 0) dx = 0;
      if (dx > 80) dx = 80;

      content.style.transform = `translateX(${dx}px)`;

    };

    const soltar = () => {

      const transformX =
        parseInt(content.style.transform.replace('translateX(', '').replace('px)', '')) || 0;

      content.style.transform = `translateX(0)`;

      if (transformX > 60) {

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
    window.addEventListener('touchmove', mover);
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

    this.VentaServicio.ListadoVentas().subscribe({
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
  FiltrarVentas() {
    this.VentasFiltradas = this.VentasOriginal
      .filter(v => {
        const coincideBusqueda =
          v.NombreCliente?.toLowerCase().includes(this.Busqueda.toLowerCase());

        const fechaVenta = new Date(v.FechaCreacion);
        const cumpleInicio = !this.FechaInicio || fechaVenta >= new Date(this.FechaInicio);
        const cumpleFin = !this.FechaFin || fechaVenta <= new Date(this.FechaFin);

        return coincideBusqueda && cumpleInicio && cumpleFin;
      })
      .sort((a, b) => {
        let valorA = a[this.CampoOrden];
        let valorB = b[this.CampoOrden];

        if (this.CampoOrden === 'NombreCliente' || this.CampoOrden === 'Usuario') {
          valorA = valorA?.toLowerCase() || '';
          valorB = valorB?.toLowerCase() || '';
        }

        if (valorA > valorB) return this.Orden === 'asc' ? 1 : -1;
        if (valorA < valorB) return this.Orden === 'asc' ? -1 : 1;
        return 0;
      });
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
CerrarModalFactura() {
  this.datosImpresion = null;
}

ImprimirVenta(CodigoPedido: number) {
  this.Procesando = true;
  this.VentaServicio.ObtenerDatosImpresionVenta(CodigoPedido).subscribe({
    next: (resp) => {
      this.datosImpresion = resp.data; // abre modal
      this.Procesando = false;
    },
    error: (err) => {
      this.Procesando = false;
      this.AlertaServicio.MostrarError('Error al obtener datos de impresión');
      console.error(err);
    }
  });
}

// Genera HTML para impresora térmica, compatible móvil
GenerarHtmlFactura(datos: any): string {
  if (!datos) return '';

  let html = `<div style="font-family:monospace; font-size:12px; width:80mm;">`;
  html += `<div style="text-align:center; font-weight:bold; font-size:14px;">${datos.empresa.nombre}</div>`;
  html += `<div>NIT: ${datos.empresa.nit}</div>`;
  html += `<div>${datos.empresa.direccion}</div>`;
  html += `<div>${datos.empresa.telefono}</div>`;
  html += `<hr style="border-style:dotted;">`;

  html += `<div>Fecha: ${datos.venta.fecha}</div>`;
  html += `<div>Atendido: ${datos.venta.usuario}</div>`;
  html += `<div>Cliente: ${datos.cliente.nombre}</div>`;
  if (datos.cliente.direccion) html += `<div>Dir: ${datos.cliente.direccion}</div>`;
  if (datos.cliente.nit) html += `<div>NIT: ${datos.cliente.nit}</div>`;
  if (datos.cliente.celular) html += `<div>Cel: ${datos.cliente.celular}</div>`;
  html += `<hr style="border-style:dotted;">`;

  html += `<div style="display:flex; font-weight:bold;"><div style="width:20%">Cant.</div><div style="width:50%">Producto</div><div style="width:30%; text-align:right;">Subtotal</div></div>`;
  datos.productos.forEach((p: any) => {
    html += `<div style="display:flex;"><div style="width:20%">${p.cantidad}</div><div style="width:50%">${p.nombre}</div><div style="width:30%; text-align:right;">Q ${p.subtotal.toFixed(2)}</div></div>`;
  });
  html += `<hr style="border-style:dotted;">`;

  html += `<div style="text-align:right;">Subtotal: Q ${datos.totales.subtotal.toFixed(2)}</div>`;
  html += `<div style="text-align:right;">Descuento: Q ${datos.totales.descuento.toFixed(2)}</div>`;
  html += `<div style="text-align:right; font-weight:bold;">TOTAL: Q ${datos.totales.total.toFixed(2)}</div>`;
  html += `<hr style="border-style:dotted;">`;

  if (datos.pago) {
    let ref = datos.pago.nombre === 'TARJETA' ? 'Ref: ' + datos.referencia + ' ' : '';
    html += `<div style="display:flex; justify-content:space-between;"><div>${ref}${datos.pago.nombre}</div><div>Q ${datos.pago.monto.toFixed(2)}</div></div>`;
  }

  html += `<div style="text-align:center;">Gracias por su compra</div>`;
  html += `</div>`;
  return html;
}

ImprimirDesdeModal() {
  if (!this.datosImpresion) return;

  const html = this.GenerarHtmlFactura(this.datosImpresion);

  // Crear iframe oculto
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`<html><head><title>Factura</title></head><body>${html}</body></html>`);
  doc.close();

  // Llamar a print directo
  iframe.contentWindow?.focus();
  try {
    iframe.contentWindow?.print();
  } catch (err) {
    console.error(err);
    this.AlertaServicio.MostrarError('Error al imprimir. Verifica la impresora.');
  } finally {
    document.body.removeChild(iframe);
    this.datosImpresion = null; // cerrar modal
  }
}
}
