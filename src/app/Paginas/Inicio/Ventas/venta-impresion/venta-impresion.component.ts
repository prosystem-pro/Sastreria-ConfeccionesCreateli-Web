import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaServicio } from '../../../../Servicios/VentaServicio';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-venta-impresion',
  imports: [FormsModule, CommonModule],
  templateUrl: './venta-impresion.component.html',
  styleUrl: './venta-impresion.component.css'
})
export class VentaImpresionComponent implements OnInit {

  private yaImprimiendo = false;
  datosImpresion: any;
  Procesando = false;

  mensajeDebug = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private VentaServicio: VentaServicio,
    private AlertaServicio: AlertaServicio
  ) {}

  ngOnInit() {

    const codigoPedido = this.route.snapshot.paramMap.get('codigoPedido');

    if (codigoPedido) {
      this.CargarDatosImpresion(Number(codigoPedido));
    }
  }

  // =========================
  // 🔥 RETORNO SEGURO
  // =========================
  volverAListado() {
    this.router.navigate(['/venta-listado']);
  }

  cerrar() {
    this.router.navigate(['/venta-listado']);
  }

  // =========================
  // 🔥 IMPRIMIR (CORREGIDO REAL)
  // =========================
  async imprimir(event?: Event) {

    const contenido = document.getElementById('ticket-impresion');

    if (!contenido) return;

    if (event) event.preventDefault();

    try {

      // 🔴 CLAVE: ocultar todo menos ticket ANTES de imprimir
      document.body.classList.add('solo-ticket-print');

      const ventana = window.open('', '_blank');

      if (!ventana) {
        window.print();
        this.volverAListado();
        return;
      }

      ventana.document.write(`
        <html>
          <head>
            <title>Factura</title>
            <style>
              body { font-family: monospace; }
            </style>
          </head>
          <body>
            ${contenido.innerHTML}
          </body>
        </html>
      `);

      ventana.document.close();
      ventana.focus();

      setTimeout(() => {

        ventana.print();
        ventana.close();

        // 🔥 restaurar UI
        document.body.classList.remove('solo-ticket-print');

        this.volverAListado();

      }, 300);

    } catch (error) {

      document.body.classList.remove('solo-ticket-print');
      this.volverAListado();

    }
  }

  // =========================
  // 🔥 CARGA + AUTO PRINT
  // =========================
  CargarDatosImpresion(codigoPedido: number) {

    this.Procesando = true;

    this.VentaServicio
      .ObtenerDatosImpresionVenta(codigoPedido)
      .subscribe({

        next: (resp) => {

          this.datosImpresion = resp.data;
          this.Procesando = false;

          setTimeout(() => {

            window.print();

            this.volverAListado();

          }, 600);

        },

        error: () => {

          this.Procesando = false;

          this.AlertaServicio
            .MostrarError('Error al cargar la factura');

        }

      });

  }

  logDebug(msg: string) {
    this.mensajeDebug += msg + '\n';
  }
}
