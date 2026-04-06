import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VentaServicio } from '../../../../Servicios/VentaServicio';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-venta-impresion',
  imports: [FormsModule, CommonModule],
  templateUrl: './venta-impresion.component.html',
  styleUrl: './venta-impresion.component.css'
})
export class VentaImpresionComponent implements OnInit {
  datosImpresion: any;
  Procesando = false;

  constructor(
    private route: ActivatedRoute,
    private VentaServicio: VentaServicio,
    private AlertaServicio: AlertaServicio
  ) { }

  ngOnInit() {
    const codigoPedido = this.route.snapshot.paramMap.get('codigoPedido');
    if (codigoPedido) {
      this.CargarDatosImpresion(Number(codigoPedido));
    }
  }

  CargarDatosImpresion(codigoPedido: number) {
    this.Procesando = true;
    this.VentaServicio.ObtenerDatosImpresionVenta(codigoPedido).subscribe({
      next: (resp) => {
        this.datosImpresion = resp.data;
        this.Procesando = false;

        // ESPERA 500ms para que Angular renderice el DOM antes de imprimir
        setTimeout(() => this.ImprimirTicket(), 500);
      },
      error: (err) => {
        this.Procesando = false;
        this.AlertaServicio.MostrarError('Error al cargar la factura');
        console.error(err);
      }
    });
  }

  ImprimirTicket() {
    if (!this.datosImpresion) return;

    const ticketContent = document.getElementById('ticket-impresion')?.innerHTML;
    if (!ticketContent) return;

    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Factura</title>
          <style>
            @media print {
              @page { size: 80mm auto; margin: 0; }
              body { width: 80mm; margin: 0; padding: 0; font-family: monospace; font-size: 14px; }
              img { max-width: 100%; height: auto; }
              hr { border-style: dotted; margin: 5px 0; }
            }
            body { width: 80mm; margin: 0; padding: 0; font-family: monospace; font-size: 14px; }
            img { max-width: 100%; height: auto; }
            hr { border-style: dotted; margin: 5px 0; }
          </style>
        </head>
        <body>${ticketContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    // Imprime automáticamente
    printWindow.print();

    // Opcional: cerrar la ventana después de imprimir
    printWindow.close();
  }
}
