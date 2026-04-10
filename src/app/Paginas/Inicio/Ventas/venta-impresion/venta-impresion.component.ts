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
  mensajeDebug = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private VentaServicio: VentaServicio,
    private AlertaServicio: AlertaServicio
  ) {}

  ngOnInit() {

    this.detectarIphone();

    this.logDebug('Componente iniciado');

    const codigoPedido = this.route.snapshot.paramMap.get('codigoPedido');

    if (codigoPedido) {
      this.logDebug('Código pedido: ' + codigoPedido);
      this.CargarDatosImpresion(Number(codigoPedido));
    } else {
      this.logDebug('No se encontró código pedido');
    }

  }

  detectarIphone() {

    const userAgent = navigator.userAgent || navigator.vendor;

    this.logDebug('UserAgent: ' + userAgent);

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      this.esIphone = true;
      this.logDebug('Dispositivo iPhone detectado');
    } else {
      this.logDebug('No es iPhone');
    }

  }

  cerrar() {
    this.router.navigate(['/venta-listado']);
  }

  imprimir() {

    this.logDebug('Botón imprimir presionado');

    try {

      if (!window) {
        this.logDebug('window no disponible');
        return;
      }

      if (!window.print) {
        this.logDebug('window.print no existe');
        return;
      }

      this.logDebug('Intentando ejecutar window.print()');

      window.print();

      this.logDebug('window.print ejecutado');

    } catch (error: any) {

      this.logDebug('Error al imprimir: ' + error?.message);
      console.error(error);

    }

  }

  CargarDatosImpresion(codigoPedido: number) {

    this.Procesando = true;

    this.logDebug('Cargando datos de impresión...');

    this.VentaServicio
      .ObtenerDatosImpresionVenta(codigoPedido)
      .subscribe({

        next: (resp) => {

          this.logDebug('Datos recibidos del servidor');

          this.datosImpresion = resp.data;
          this.Procesando = false;

          if (!this.esIphone) {

            this.logDebug('Impresión automática Android/PC');

            setTimeout(() => {

              try {

                window.print();
                this.logDebug('Impresión automática ejecutada');

              } catch (e: any) {

                this.logDebug('Error impresión automática: ' + e.message);

              }

            }, 600);

          } else {

            this.logDebug('iPhone detectado, impresión manual');

          }

        },

        error: (err) => {

          this.Procesando = false;

          this.logDebug('Error al cargar factura');

          this.AlertaServicio
            .MostrarError('Error al cargar la factura');

          console.error(err);

        }

      });

  }

  logDebug(mensaje: string) {

    console.log(mensaje);

    this.mensajeDebug += mensaje + '\n';

  }

}
