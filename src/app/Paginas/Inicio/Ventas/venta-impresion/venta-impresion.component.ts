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

  esIphone = false;
  mensajeDebug = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private VentaServicio: VentaServicio,
    private AlertaServicio: AlertaServicio
  ) {}

  // ======================
  // INIT
  // ======================
  ngOnInit() {

    this.detectarIphone();

    const codigoPedido = this.route.snapshot.paramMap.get('codigoPedido');

    if (codigoPedido) {
      this.CargarDatosImpresion(Number(codigoPedido));
    }

  }

  // ======================
  // RETURN CONTROLADO
  // ======================
  private volverAListado() {
    setTimeout(() => {
      this.router.navigate(['/venta-listado']);
    }, 1200);
  }

  // ======================
  // DETECTAR IPHONE
  // ======================
  detectarIphone() {

    const userAgent = navigator.userAgent || navigator.vendor;

    this.logDebug('UserAgent: ' + userAgent);

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      this.esIphone = true;
      this.logDebug('Dispositivo iPhone detectado');
    } else {
      this.esIphone = false;
    }
  }

  cerrar() {
    this.router.navigate(['/venta-listado']);
  }

  // ======================
  // IMPRESIÓN
  // ======================
  async imprimir(event?: Event) {

    this.logDebug('Impresión solicitada');

    try {

      const contenido = document.getElementById('ticket-impresion');

      if (!contenido) return;

      if (event) event.preventDefault();

      // ======================
      // 🍎 IPHONE
      // ======================
      if (this.esIphone) {

        const canvas = await html2canvas(contenido, {
          scale: 2,
          backgroundColor: '#ffffff'
        });

        canvas.toBlob(async (blob) => {

          if (!blob) return;

          const file = new File([blob], 'factura.png', {
            type: 'image/png'
          });

          if (navigator.share && navigator.canShare?.({ files: [file] })) {

            await navigator.share({
              title: 'Factura',
              text: 'Factura de venta',
              files: [file]
            });

          } else {
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
          }

          // 🔥 siempre regresar
          this.volverAListado();

        });

        return;
      }

      // ======================
      // 💻 PC / ANDROID
      // ======================
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

        this.volverAListado();

      }, 300);

    } catch (error: any) {

      console.error(error);
      this.volverAListado();

    }
  }

  // ======================
  // CARGAR DATOS
  // ======================
  CargarDatosImpresion(codigoPedido: number) {

    this.Procesando = true;

    this.VentaServicio
      .ObtenerDatosImpresionVenta(codigoPedido)
      .subscribe({

        next: (resp) => {

          this.datosImpresion = resp.data;
          this.Procesando = false;

          if (!this.esIphone) {

            setTimeout(() => {

              try {

                window.print();

              } catch (e) {
                console.error(e);
              }

              this.volverAListado();

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

  // ======================
  // DEBUG
  // ======================
  logDebug(mensaje: string) {
    this.mensajeDebug += mensaje + '\n';
  }

}
