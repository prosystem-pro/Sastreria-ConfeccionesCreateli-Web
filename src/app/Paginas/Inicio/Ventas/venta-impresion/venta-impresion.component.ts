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
mensajeDebug = '';
  datosImpresion: any;
  Procesando = false;
  esIOS = false;

  constructor(
    private route: ActivatedRoute,
    private VentaServicio: VentaServicio,
    private AlertaServicio: AlertaServicio
  ) { }

  ngOnInit() {

    // Detectar iPhone/iPad
    this.esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    const codigoPedido = this.route.snapshot.paramMap.get('codigoPedido');

    if (codigoPedido) {
      this.CargarDatosImpresion(Number(codigoPedido));
    }
  }

  CargarDatosImpresion(codigoPedido: number) {

    this.Procesando = true;

    this.VentaServicio.ObtenerDatosImpresionVenta(codigoPedido).subscribe({

      next: (resp) => {

        console.log('DATOS', resp);

        this.datosImpresion = resp.data;
        this.Procesando = false;

        // Android y Desktop imprimen automático
        if (!this.esIOS) {
          setTimeout(() => {
            window.print();
          }, 800);
        }
      },

      error: (err) => {

        this.Procesando = false;
        this.AlertaServicio.MostrarError('Error al cargar la factura');
        console.error(err);

      }

    });
  }

Imprimir() {

  try {

    this.mensajeDebug = '1️⃣ Botón presionado';

    const contenido = document.getElementById('ticket-impresion');

    if (!contenido) {
      this.mensajeDebug = '❌ 2️⃣ No se encontró ticket-impresion';
      return;
    }

    this.mensajeDebug = '2️⃣ Ticket encontrado';

    const htmlTicket = contenido.innerHTML;

    if (!htmlTicket || htmlTicket.length < 50) {
      this.mensajeDebug = '❌ 3️⃣ Ticket vacío o muy pequeño';
      return;
    }

    this.mensajeDebug = '3️⃣ HTML del ticket listo';

    const ventana = window.open('', '_blank');

    if (!ventana) {
      this.mensajeDebug = '❌ 4️⃣ iPhone bloqueó window.open';
      return;
    }

    this.mensajeDebug = '4️⃣ Ventana abierta';

    ventana.document.open();

    ventana.document.write(`
      <html>
        <head>
          <title>Factura</title>

          <meta name="viewport" content="width=device-width, initial-scale=1">

          <style>

            body {
              font-family: monospace;
              font-size:18px;
              padding:20px;
            }

            hr {
              border-style:dotted;
            }

          </style>

        </head>

        <body>

          <div id="contenido">
            ${htmlTicket}
          </div>

          <script>

            try {

              document.addEventListener('DOMContentLoaded', function() {

                setTimeout(function() {

                  try {

                    window.focus();

                    window.print();

                  } catch(e) {

                    alert('ERROR PRINT: ' + e.message);

                  }

                }, 800);

              });

            } catch(e) {

              alert('ERROR SCRIPT: ' + e.message);

            }

          <\/script>

        </body>
      </html>
    `);

    ventana.document.close();

    this.mensajeDebug = '5️⃣ HTML enviado a la ventana';

    setTimeout(() => {

      try {

        ventana.focus();

        this.mensajeDebug = '6️⃣ Ventana enfocada, esperando impresión';

      } catch (e: any) {

        this.mensajeDebug = '❌ Error al enfocar ventana: ' + e.message;

      }

    }, 500);

  } catch (error: any) {

    this.mensajeDebug = '❌ ERROR GENERAL: ' + error.message;

  }

}
}
