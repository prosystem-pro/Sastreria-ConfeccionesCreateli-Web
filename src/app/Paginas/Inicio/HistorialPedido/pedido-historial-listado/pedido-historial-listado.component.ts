import { Component, OnInit } from '@angular/core';
import { HistorialPedidoServicio } from '../../../../Servicios/HistorialPedidoServicio';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';

@Component({
  selector: 'app-pedido-historial-listado',
  imports: [CommonModule, FormsModule, SpinnerGlobalComponent],
  templateUrl: './pedido-historial-listado.component.html',
  styleUrl: './pedido-historial-listado.component.css'
})
export class PedidoHistorialListadoComponent implements OnInit {

  Procesando = false;
  FechaInicio: string = '';
  FechaFin: string = '';

  PedidosOriginal: any[] = [];
  PedidosFiltrados: any[] = [];

  Busqueda: string = '';
  CampoOrden: string = 'NombreCliente';
  Orden: 'asc' | 'desc' = 'asc';

  Cargando: boolean = false;
  Error: string = '';

  constructor(
    private HistorialPedidoServicio: HistorialPedidoServicio,
    private Router: Router
  ) { }

  ngOnInit(): void {
    this.CargarEntregados();
  }

  // ------------------- CARGA -------------------
  CargarEntregados() {

    this.Procesando = true;
    this.Cargando = true;
    this.Error = '';

    this.HistorialPedidoServicio.ListadoEntregados()
      .subscribe({

        next: (Respuesta: any) => {

          this.PedidosOriginal = Respuesta.data || [];
          this.FiltrarPedidos();

          this.Cargando = false;
          this.Procesando = false;

        },

        error: () => {

          this.Error = 'Error al cargar el historial de pedidos.';
          this.Cargando = false;
          this.Procesando = false;

        }

      });

  }

  // ------------------- FILTROS -------------------
  FiltrarPedidos() {

    this.PedidosFiltrados = this.PedidosOriginal
      .filter(p => {

        const coincideBusqueda =
          p.NombreCliente?.toLowerCase().includes(this.Busqueda.toLowerCase());

        const fechaPedido = new Date(p.FechaCreacion);

        const cumpleInicio =
          !this.FechaInicio || fechaPedido >= new Date(this.FechaInicio);

        const cumpleFin =
          !this.FechaFin || fechaPedido <= new Date(this.FechaFin);

        return coincideBusqueda && cumpleInicio && cumpleFin;

      })
      .sort((a, b) => {

        let valorA = a[this.CampoOrden];
        let valorB = b[this.CampoOrden];

        if (this.CampoOrden === 'NombreCliente') {
          valorA = valorA?.toLowerCase() || '';
          valorB = valorB?.toLowerCase() || '';
        }

        if (valorA > valorB) return this.Orden === 'asc' ? 1 : -1;
        if (valorA < valorB) return this.Orden === 'asc' ? -1 : 1;
        return 0;

      });

  }

  // ------------------- ORDEN -------------------
  OrdenarPor(campo: string) {

    if (this.CampoOrden === campo) {
      this.Orden = this.Orden === 'asc' ? 'desc' : 'asc';
    } else {
      this.CampoOrden = campo;
      this.Orden = 'asc';
    }

    this.FiltrarPedidos();
  }

  ObtenerIconoOrden(campo: string) {

    if (this.CampoOrden !== campo) {
      return 'bi-arrow-down-up';
    }

    return this.Orden === 'asc'
      ? 'bi-sort-up'
      : 'bi-sort-down';
  }

  // ------------------- RUTAS -------------------
  IrARuta(Ruta: string) {
    this.Router.navigate([Ruta]);
  }

  IrAHistorial(Codigo: number) {
    this.Router.navigate(['/pedido-historial', Codigo]);
  }
}
