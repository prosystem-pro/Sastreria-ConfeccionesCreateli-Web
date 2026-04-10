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
      this.mensajeDebug = '❌ No se encontró el ticket';
      return;
    }

    this.mensajeDebug = '2️⃣ Ticket encontrado';

    // Forzar enfoque
    window.focus();

    this.mensajeDebug = '3️⃣ Ejecutando window.print()';

    window.print();

    this.mensajeDebug = '4️⃣ Comando de impresión enviado';

  } catch (error: any) {

    this.mensajeDebug = '❌ Error: ' + error.message;

  }

}
}
