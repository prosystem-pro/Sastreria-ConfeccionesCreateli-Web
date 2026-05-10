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
 
    // ✅ Listeners para PC Y iPhone (antes solo era para iPhone)
    window.addEventListener('beforeprint', () => {
      this.logDebug('beforeprint disparado');
      this.activarModoImpresion();
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
 
    window.addEventListener('afterprint', () => {
      this.logDebug('afterprint disparado');
      this.desactivarModoImpresion();
 
      if (this.esIphone) {
        setTimeout(() => {
          this.volverAListado();
        }, 300);
      }
    });
 
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
 
    try {
 
      this.activarModoImpresion(); // 🔒 BLOQUEA TODO
 
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
 
      const contenido = document.getElementById('ticket-impresion');
 
      if (!contenido) {
        this.desactivarModoImpresion();
        return;
      }
 
      if (event) event.preventDefault();
 
      const canvas = await html2canvas(contenido, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight
      });
 
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve)
      );
 
      this.desactivarModoImpresion(); // 🔓 SIEMPRE RESTAURAR
 
      if (!blob) return;
 
      const file = new File([blob], 'factura.png', { type: 'image/png' });
 
      if (this.esIphone && navigator.share) {
 
        await navigator.share({
          title: 'Factura',
          files: [file]
        });
 
      } else {
 
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
 
      }
 
    } catch (error) {
 
      console.error(error);
      this.desactivarModoImpresion(); // 🔓 seguridad
 
    }
  }
 
  private activarModoImpresion() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '0px';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  }
 
  private desactivarModoImpresion() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.height = '';
  }
 
  CargarDatosImpresion(codigoPedido: number) {
 
    this.Procesando = true;
    this.logDebug('Cargando datos de impresión...');
 
    this.VentaServicio
      .ObtenerDatosImpresion(codigoPedido)
      .subscribe({
 
        next: (resp) => {
          console.log('ira', resp)
          this.logDebug('Datos recibidos del servidor');
 
          this.datosImpresion = resp.data;
          this.Procesando = false;
 
          if (!this.esIphone) {
 
            this.logDebug('Impresión automática Android/PC');
 
            setTimeout(() => {
 
              try {
 
                // ✅ Bloquear scroll ANTES de imprimir
                this.activarModoImpresion();
 
                window.print();
                this.logDebug('Impresión automática ejecutada');
 
              } catch (e: any) {
 
                this.logDebug('Error impresión automática: ' + e.message);
                this.desactivarModoImpresion(); // 🔓 si falla, restaurar
 
              }
 
              // ✅ afterprint se encarga de desactivarModoImpresion en el caso normal
 
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
