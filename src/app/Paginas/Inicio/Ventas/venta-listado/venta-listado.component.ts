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
ImprimirVenta(CodigoPedido: number) {
  this.Procesando = true;

  this.VentaServicio.ObtenerDatosImpresionVenta(CodigoPedido).subscribe({
    next: (resp) => {
      const datos = resp.data;

      // Generar HTML plano para imprimir
      const html = `
        <html>
          <head>
            <title>Factura</title>
            <style>
              body { font-family: monospace; font-size:12px; width:80mm; margin:0; padding:0; }
              hr { border-style: dotted; margin:2mm 0; }
              .flex { display:flex; justify-content:space-between; }
              .text-center { text-align:center; }
              .bold { font-weight:bold; }
              .right { text-align:right; }
            </style>
          </head>
          <body>
            <div class="text-center bold">${datos.empresa.nombre}</div>
            <div class="text-center">NIT: ${datos.empresa.nit}</div>
            <div class="text-center">${datos.empresa.direccion}</div>
            <div class="text-center">${datos.empresa.telefono}</div>
            <hr>

            <div class="text-center bold">Datos del comprobante</div>
            <div class="flex">
              <div>
                Fecha: ${datos.venta.fecha}<br>
                Atendido: ${datos.venta.usuario}<br>
                Cliente: ${datos.cliente.nombre}<br>
                ${datos.cliente.direccion ? 'Dirección: ' + datos.cliente.direccion : ''}
              </div>
              <div>
                Documento: ${datos.venta.documento}<br>
                ${datos.cliente.nit ? 'NIT: ' + datos.cliente.nit : ''}<br>
                ${datos.cliente.celular ? 'Celular: ' + datos.cliente.celular : ''}
              </div>
            </div>
            <hr>

            <div class="text-center bold">Productos</div>
            <div class="flex bold">
              <div style="width:20%">Cant.</div>
              <div style="width:50%">Producto</div>
              <div style="width:30%" class="right">Subtotal</div>
            </div>
            ${datos.productos.map((p: any) => `
              <div class="flex">
                <div style="width:20%">${p.cantidad}</div>
                <div style="width:50%">${p.nombre}</div>
                <div style="width:30%" class="right">Q ${p.subtotal}</div>
              </div>
            `).join('')}
            <hr>

            <div class="flex right">
              <div style="width:50%">
                <div class="flex"><span>Subtotal</span><span>Q ${datos.totales.subtotal}</span></div>
                <div class="flex"><span>Descuento</span><span>Q ${datos.totales.descuento}</span></div>
                <div class="flex bold"><span>Total</span><span>Q ${datos.totales.total}</span></div>
              </div>
            </div>
            <div class="text-center bold">Forma de pago</div>
            <div class="flex">
              ${datos.pago.nombre === 'TARJETA' ? `
                <div style="width:50%">Referencia: ${datos.referencia}</div>
                <div style="width:25%" class="text-center">${datos.pago.nombre}</div>
                <div style="width:25%" class="right">Q ${datos.pago.monto}</div>
              ` : `
                <div style="width:50%"></div>
                <div style="width:25%" class="text-center">${datos.pago.nombre}</div>
                <div style="width:25%" class="right">Q ${datos.pago.monto}</div>
              `}
            </div>
            <hr>
            <div class="text-center">Gracias por su compra</div>
          </body>
        </html>
      `;

      // Crear iframe oculto y enviar HTML plano
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          document.body.removeChild(iframe);
        }, 200);
      }

      this.Procesando = false;
    },
    error: (error) => {
      this.Procesando = false;
      this.AlertaServicio.MostrarError('Error al imprimir venta');
      console.error(error);
    }
  });
}
}
