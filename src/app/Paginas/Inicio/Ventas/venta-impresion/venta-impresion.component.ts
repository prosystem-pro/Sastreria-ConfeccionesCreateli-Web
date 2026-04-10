import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  Procesando = true;
  esIOS = false;

  constructor(
    private route: ActivatedRoute,
    private Router: Router,
    private VentaServicio: VentaServicio,
    private AlertaServicio: AlertaServicio
  ) {}

  ngOnInit() {

    this.esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    const codigoPedido = this.route.snapshot.paramMap.get('codigoPedido');

    if (codigoPedido) {
      this.CargarDatosImpresion(Number(codigoPedido));
    }

  }

  CargarDatosImpresion(codigoPedido: number) {

    this.VentaServicio
      .ObtenerDatosImpresionVenta(codigoPedido)
      .subscribe({

        next: (resp) => {

          this.datosImpresion = resp.data;

          if (!this.esIOS) {

            setTimeout(() => {
              this.Imprimir();
            }, 600);

          } else {

            this.Procesando = false;

          }

        },

        error: () => {

          this.Procesando = false;

          this.AlertaServicio.MostrarError(
            'Error al cargar la factura'
          );

          this.Router.navigate(['/venta-listado']);

        }

      });

  }

  Imprimir() {

    const contenido = document.getElementById('ticket-impresion');

    if (!contenido) return;

    const ventana = window.open('', '', 'width=600,height=800');

    if (!ventana) return;

    ventana.document.write(`
      <html>
        <head>
          <title>Impresion</title>
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

      this.Procesando = false;

      this.Router.navigate(['/venta-listado']);

    }, 500);

  }

}
