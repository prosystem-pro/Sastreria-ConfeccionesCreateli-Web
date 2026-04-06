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

// Genera el texto plano de la factura para la impresora térmica
GenerarTextoFactura(datos: any): string {
  if (!datos) return '';

  let texto = '';
  texto += '         ' + datos.empresa.nombre + '\n';
  texto += 'NIT: ' + datos.empresa.nit + '\n';
  texto += datos.empresa.direccion + '\n';
  texto += 'Tel: ' + datos.empresa.telefono + '\n';
  texto += '--------------------------------\n';

  texto += 'Fecha: ' + datos.venta.fecha + '\n';
  texto += 'Atendido: ' + datos.venta.usuario + '\n';
  texto += 'Cliente: ' + datos.cliente.nombre + '\n';
  if (datos.cliente.direccion) texto += 'Dir: ' + datos.cliente.direccion + '\n';
  if (datos.cliente.nit) texto += 'NIT: ' + datos.cliente.nit + '\n';
  if (datos.cliente.celular) texto += 'Cel: ' + datos.cliente.celular + '\n';
  texto += '--------------------------------\n';

  texto += 'Cant  Producto                Subtot\n';
  texto += '--------------------------------\n';
  datos.productos.forEach((p: any) => {
    const cant = p.cantidad.toString().padEnd(4, ' ');
    const nombre = p.nombre.padEnd(20, ' ');
    const subtotal = p.subtotal.toFixed(2).padStart(6, ' ');
    texto += `${cant} ${nombre} ${subtotal}\n`;
  });
  texto += '--------------------------------\n';

  texto += `Subtotal: ${datos.totales.subtotal.toFixed(2)}\n`;
  texto += `Descuento: ${datos.totales.descuento.toFixed(2)}\n`;
  texto += `TOTAL: ${datos.totales.total.toFixed(2)}\n`;
  texto += '--------------------------------\n';

  if (datos.pago) {
    let ref = datos.pago.nombre === 'TARJETA' ? 'Ref: ' + datos.referencia : '';
    texto += `${ref} ${datos.pago.nombre} Q${datos.pago.monto.toFixed(2)}\n`;
  }

  texto += '        Gracias por su compra!\n';
  return texto;
}

// Enviar a la app de la impresora
ImprimirDesdeModal() {
  if (!this.datosImpresion) return;

  const texto = this.GenerarTextoFactura(this.datosImpresion);

  // Aquí depende de tu app de impresión en el móvil:
  // Por ejemplo, copiar al portapapeles y abrir la app de impresora MHT-P80A
  navigator.clipboard.writeText(texto).then(() => {
    this.AlertaServicio.MostrarExito('Texto copiado. Pega en la app de la impresora.');
    this.datosImpresion = null; // cerrar modal
  }).catch(err => {
    console.error(err);
    this.AlertaServicio.MostrarError('No se pudo copiar el texto para imprimir');
  });
}
}
