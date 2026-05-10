import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HistorialPedidoServicio } from '../../../../Servicios/HistorialPedidoServicio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pago-impresion',
  imports: [FormsModule, CommonModule],
  templateUrl: './pago-impresion.component.html',
  styleUrl: './pago-impresion.component.css'
})
export class PagoImpresionComponent implements OnInit {

  CodigoPago!: number;
  datosImpresion: any;
  Procesando = false;
  VerOtros = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicio: HistorialPedidoServicio
  ) { }

  ngOnInit(): void {

    this.VerOtros =
      this.route.snapshot.queryParamMap.get('verOtros') === 'true';

    this.CodigoPago = Number(this.route.snapshot.paramMap.get('CodigoPago'));

    if (this.CodigoPago) {
      this.CargarDatos();
    }
  }

  CargarDatos() {

    this.Procesando = true;

    this.servicio
      .ObtenerDatosImpresionPagoPedido(this.CodigoPago)
      .subscribe({

        next: (resp) => {

          this.datosImpresion = resp?.data;
          this.Procesando = false;

          // impresión automática
          setTimeout(() => window.print(), 300);
        },

        error: (err) => {
          console.error(err);
          this.Procesando = false;
        }
      });
  }
  cerrar() {

    if (this.VerOtros) {

      this.router.navigate(
        ['/pedido-listado'],
        { queryParams: { verOtros: true } }
      );

    } else {

      this.router.navigate(['/pedido-listado']);

    }

  }
}
