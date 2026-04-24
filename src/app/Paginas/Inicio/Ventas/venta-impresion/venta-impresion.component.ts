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

  datosImpresion: any;
  Procesando = false;

  mensajeDebug = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private VentaServicio: VentaServicio,
    private AlertaServicio: AlertaServicio
  ) {}

  // =========================
  // INIT
  // =========================
  ngOnInit() {

    const codigoPedido = this.route.snapshot.paramMap.get('codigoPedido');

    if (codigoPedido) {
      this.CargarDatosImpresion(Number(codigoPedido));
    }
  }

  // =========================
  // RETORNO
  // =========================
  volverAListado() {
    this.router.navigate(['/venta-listado']);
  }

  cerrar() {
    this.router.navigate(['/venta-listado']);
  }

  // =========================
  // IMPRIMIR (CORRECTO)
  // =========================
  async imprimir(event?: Event) {

    this.logDebug('Impresión solicitada');

    const contenido = document.getElementById('ticket-impresion');

    if (!contenido) return;

    if (event) event.preventDefault();

    try {

      // 🔥 CLAVE: crear ventana SOLO con factura
      const ventana = window.open('', '_blank');

      if (!ventana) {
        this.volverAListado();
        return;
      }

      ventana.document.open();
      ventana.document.write(`
        <html>
          <head>
            <title>Factura</title>
            <style>
              body { font-family: monospace; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${contenido.innerHTML}
          </body>
        </html>
      `);
      ventana.document.close();

      // 🔥 retorno seguro
      setTimeout(() => {
        this.volverAListado();
      }, 1200);

    } catch (error) {

      console.error(error);
      this.volverAListado();

    }
  }

  // =========================
  // CARGAR + AUTO PRINT
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

            const contenido = document.getElementById('ticket-impresion');

            if (!contenido) return;

            const ventana = window.open('', '_blank');

            if (!ventana) return;

            ventana.document.open();
            ventana.document.write(`
              <html>
                <head>
                  <title>Factura</title>
                </head>
                <body onload="window.print(); window.close();">
                  ${contenido.innerHTML}
                </body>
              </html>
            `);
            ventana.document.close();

            this.volverAListado();

          }, 600);

        },

        error: (err) => {

          this.Procesando = false;

          this.AlertaServicio
            .MostrarError('Error al cargar la factura');

          console.error(err);

        }

      });

  }

  // =========================
  logDebug(mensaje: string) {
    this.mensajeDebug += mensaje + '\n';
  }
}
