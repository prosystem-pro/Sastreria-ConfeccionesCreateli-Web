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

        // Espera a que Angular renderice el contenido
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
    const originalContents = document.body.innerHTML;
    const printContents = document.getElementById('ticket-impresion')?.innerHTML;

    if (!printContents) return;

    // Reemplaza el body con el ticket
    document.body.innerHTML = printContents;

    // Aplica estilos de impresión
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { width: 100%; max-width: 80mm; margin:0; font-family: monospace; font-size:14px; }
        hr { border-style: dotted; margin:5px 0; }
        img { width:90%; max-width:80mm; display:block; margin:0 auto; }
      }
    `;
    document.head.appendChild(style);

    // Lanza la impresión automática
    window.print();

    // Restaura el contenido original después de imprimir
    document.body.innerHTML = originalContents;
  }
}
