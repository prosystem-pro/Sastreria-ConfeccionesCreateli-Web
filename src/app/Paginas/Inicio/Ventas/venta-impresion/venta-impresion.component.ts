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
    } else {
      this.router.navigate(['/venta-listado']);
    }

  }

  CargarDatosImpresion(codigoPedido: number) {

    this.Procesando = true;

    this.VentaServicio
      .ObtenerDatosImpresionVenta(codigoPedido)
      .subscribe({

        next: (resp) => {

          this.datosImpresion = resp.data;

          setTimeout(() => {
            this.Imprimir();
          }, 600);

        },

        error: (err) => {

          this.Procesando = false;

          this.AlertaServicio.MostrarError(
            'Error al cargar la factura'
          );

          console.error(err);

          this.router.navigate(['/venta-listado']);

        }

      });

  }

  Imprimir() {

    const contenido = document.getElementById('ticket-impresion');

    if (!contenido) {
      this.Procesando = false;
      return;
    }

    const ventana = window.open('', '', 'width=600,height=800');

    if (!ventana) {
      this.Procesando = false;
      return;
    }

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

      this.router.navigate(['/venta-listado']);

    }, 500);

  }

}
