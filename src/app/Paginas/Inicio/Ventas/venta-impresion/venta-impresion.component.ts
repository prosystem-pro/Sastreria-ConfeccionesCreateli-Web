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
  origen: string = 'venta';
  private yaImprimiendo = false;
  datosImpresion: any;
  Procesando = false;

  esIphone = false;
  mensajeDebug = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private VentaServicio: VentaServicio,
    private AlertaServicio: AlertaServicio
  ) { }

  ngOnInit() {

    this.detectarIphone();

    this.route.queryParams.subscribe(params => {
      this.origen = params['origen'] || 'venta';
    });

    if (this.esIphone) {
      window.addEventListener('beforeprint', () => {
        this.logDebug('beforeprint disparado');
      });

      window.addEventListener('afterprint', () => {
        this.logDebug('afterprint disparado');

        // 👇 SOLO ESTO SE AGREGA
        setTimeout(() => {
          this.volverAListado();
        }, 300);

      });
    }

    const codigoPedido = this.route.snapshot.paramMap.get('codigoPedido');

    if (codigoPedido) {
      this.CargarDatosImpresion(Number(codigoPedido));
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

    if (this.origen === 'venta') {
      this.router.navigate(['/venta-listado']);
      return;
    }

    if (this.origen === 'pedido') {
      this.router.navigate(['/pedido-listado']);
      return;
    }

    this.router.navigate(['/']);

  }

async imprimir(event?: Event) {

  this.logDebug('Impresión solicitada');

  const desbloquear = () => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.style.userSelect = '';

    window.removeEventListener('wheel', bloquearScroll);
    window.removeEventListener('touchmove', bloquearScroll);
  };

  const bloquearScroll = (e: Event) => {
    e.preventDefault();
  };

  try {

    // 🔒 BLOQUEAR INTERACCIÓN COMPLETA
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.userSelect = 'none';

    window.addEventListener('wheel', bloquearScroll, { passive: false });
    window.addEventListener('touchmove', bloquearScroll, { passive: false });

    window.scrollTo(0, 0);

    const contenido = document.getElementById('ticket-impresion');

    if (!contenido) {
      this.logDebug('No se encontró ticket-impresion');
      desbloquear();
      return;
    }

    if (event) event.preventDefault();

    // 🍎 IPHONE
    if (this.esIphone) {

      const canvas = await html2canvas(contenido, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight
      });

      canvas.toBlob(async (blob) => {

        desbloquear();

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

      });

      return;
    }

    // 🤖 PC / ANDROID
    const ventana = window.open('', '_blank');

    if (!ventana) {

      window.print();
      desbloquear();
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

      desbloquear();

    }, 300);

  } catch (error: any) {

    console.error(error);
    this.logDebug('Error impresión: ' + error?.message);

    // 🔓 SIEMPRE DESBLOQUEAR
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.style.userSelect = '';

    window.removeEventListener('wheel', bloquearScroll);
    window.removeEventListener('touchmove', bloquearScroll);
  }
}
  CargarDatosImpresion(codigoPedido: number) {

    this.Procesando = true;

    this.logDebug('Cargando datos de impresión...');

    this.VentaServicio
      .ObtenerDatosImpresion(codigoPedido)
      .subscribe({

        next: (resp) => {
console.log('datos de impresion', resp)
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
  volverAListado() {
    this.router.navigate(['/venta-listado']);
  }
  logDebug(mensaje: string) {


    this.mensajeDebug += mensaje + '\n';

  }

}
