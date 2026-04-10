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

    const contenido = document.getElementById('ticket-impresion')?.innerHTML;

    if (!contenido) return;

    const ventana = window.open('', '_blank');

    if (!ventana) return;

    ventana.document.write(`
    <html>
      <head>
        <title>Factura</title>
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

        ${contenido}

        <script>
          window.onload = function() {
            setTimeout(function(){
              window.print();
            }, 500);
          }
        <\/script>

      </body>
    </html>
  `);

    ventana.document.close();
  }
}
