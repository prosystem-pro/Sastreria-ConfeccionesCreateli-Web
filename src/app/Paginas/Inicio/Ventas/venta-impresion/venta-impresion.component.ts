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
  Procesando = false;

  esIphone = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private VentaServicio: VentaServicio,
    private AlertaServicio: AlertaServicio
  ) {}

  ngOnInit() {

    this.detectarIphone();

    const codigoPedido = this.route.snapshot.paramMap.get('codigoPedido');

    if (codigoPedido) {
      this.CargarDatosImpresion(Number(codigoPedido));
    }

  }

  detectarIphone() {

    const userAgent = navigator.userAgent || navigator.vendor;

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      this.esIphone = true;
    }

  }

  cerrar() {
    this.router.navigate(['/venta-listado']);
  }

  imprimir() {
    window.print();
  }

  CargarDatosImpresion(codigoPedido: number) {

    this.Procesando = true;

    this.VentaServicio
      .ObtenerDatosImpresionVenta(codigoPedido)
      .subscribe({

        next: (resp) => {

          this.datosImpresion = resp.data;
          this.Procesando = false;

          // Android y PC imprimen automático
          if (!this.esIphone) {

            setTimeout(() => {
              window.print();
            }, 600);

          }

        },

        error: (err) => {

          this.Procesando = false;

          this.AlertaServicio
            .MostrarError('Error al cargar la factura');

          console.error(err);

        }

      });

  }
}
