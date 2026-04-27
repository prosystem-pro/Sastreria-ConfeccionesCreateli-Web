import { Component, OnInit } from '@angular/core';
import { HistorialPedidoServicio } from '../../../../Servicios/HistorialPedidoServicio';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { LoginServicio } from '../../../../Servicios/LoginServicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';

@Component({
  selector: 'app-pedido-listado',
  imports: [CommonModule, FormsModule, SpinnerGlobalComponent],
  templateUrl: './pedido-listado.component.html',
  styleUrl: './pedido-listado.component.css'
})
export class PedidoListadoComponent implements OnInit {
  VerOtros: boolean = false;
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
  Rol: string | null = null;
  Roles: string | null = null;
  SuperAdmin: number | null = null;

  // Arrastre
  Arrastrando: boolean = false;
  InicioX: number = 0;
  UmbralEliminar: number = 80;
  PedidoArrastrado: any = null;
  ElementoFila: HTMLElement | null = null;



  constructor(private HistorialPedidoServicio: HistorialPedidoServicio,
    private Router: Router,
    private AlertaServicio: AlertaServicio,
    private LoginServicio: LoginServicio,
    private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.Roles = this.LoginServicio.ObtenerRol();
    const payload = this.LoginServicio.ObtenerPayloadToken();
    this.Rol = payload?.NombreRol || null;
    this.SuperAdmin = payload?.SuperAdmin || null;

    this.VerOtros = this.route.snapshot.queryParamMap.get('verOtros') === 'true';

    this.CargarPedidos(this.VerOtros);
  }
  ObtenerClaseEstatus(Estatus: number) {

    switch (Estatus) {
      case 1: return 'btn btn-cortado text-white';
      case 2: return 'btn btn-danger text-white';
      case 3: return 'btn btn-warning text-dark';
      case 4: return 'btn btn-success text-white';
      default: return 'btn btn-secondary';
    }

  }

  ObtenerIconoEstatus(Estatus: number) {

    switch (Estatus) {
      case 1: return 'bi bi-scissors fw-bold';
      case 2: return 'bi bi-exclamation-circle fw-bold';
      case 3: return 'bi bi-gear';
      case 4: return 'bi bi-check-circle fw-bold';
      default: return 'bi bi-question-circle fw-bold';
    }

  }
  // ------------------- ARRASTRE -------------------
  IniciarArrastre(event: any, Pedido: any) {
    this.Arrastrando = true;
    this.PedidoArrastrado = Pedido;
    this.InicioX = event.touches?.[0].clientX || event.clientX;
    this.ElementoFila = (event.currentTarget as HTMLElement).querySelector('.fila-contenido');
    (event.currentTarget as HTMLElement).classList.add('activa');
  }

  DuranteArrastre(event: any) {
    if (!this.Arrastrando || !this.ElementoFila) return;

    const XActual = event.touches?.[0].clientX || event.clientX;
    let desplazamiento = XActual - this.InicioX;

    // Limitar a que no se mueva hacia la izquierda
    if (desplazamiento < 0) desplazamiento = 0;

    // Limitar al ancho del contenedor
    const anchoCart = this.ElementoFila.parentElement?.offsetWidth || 0;
    if (desplazamiento > anchoCart * 0.7) {
      desplazamiento = anchoCart * 0.7;
    }

    // Aplicar transform y sombra
    this.ElementoFila.style.transform = `translateX(${desplazamiento}px)`;
    this.ElementoFila.style.boxShadow = `rgba(0,0,0,0.2) ${desplazamiento / 10}px 4px 8px -2px`;
  }
  FinalizarArrastre() {
    if (!this.Arrastrando || !this.ElementoFila) return;

    const Desplazamiento = parseInt(this.ElementoFila.style.transform.replace('translateX(', '')) || 0;
    this.ElementoFila.parentElement?.classList.remove('activa');

    if (Desplazamiento > this.UmbralEliminar) {
      // Llama a la confirmación de eliminación
      this.EliminarPedidoConfirmacion(this.PedidoArrastrado);
    } else {
      this.ElementoFila.style.transform = 'translateX(0)';
      this.LimpiarArrastre();
    }

    this.Arrastrando = false;
  }

  EliminarPedidoConfirmacion(Pedido: any) {
    if (!Pedido) return;

    // Formatear el monto
    const montoFormateado = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(Pedido.Total);

    this.AlertaServicio.Confirmacion(
      '¿Eliminar este pedido?',
      `Cliente: ${Pedido.NombreCliente}\nMonto: ${montoFormateado}`,
      'Eliminar',
      'Cancelar'
    ).then((confirmado: boolean) => {
      if (confirmado) {
        // Mostrar spinner global
        this.Procesando = true;

        this.HistorialPedidoServicio.EliminarPedido(Pedido.CodigoPedido).subscribe({
          next: () => {
            // Quitar pedido de la lista
            this.PedidosOriginal = this.PedidosOriginal.filter(p => p.CodigoPedido !== Pedido.CodigoPedido);
            this.FiltrarPedidos();

            // Mostrar éxito
            this.AlertaServicio.MostrarExito('Pedido eliminado correctamente');

            // Limpiar arrastre
            if (this.ElementoFila) this.ElementoFila.style.transform = 'translateX(0)';
            this.LimpiarArrastre();

            // Ocultar spinner
            this.Procesando = false;
          },
          error: (error) => {
            console.error(error);
            // Mostrar error
            const mensaje = error?.message || 'Error al eliminar el pedido';
            this.AlertaServicio.MostrarError(mensaje);

            if (this.ElementoFila) this.ElementoFila.style.transform = 'translateX(0)';
            this.LimpiarArrastre();

            // Ocultar spinner
            this.Procesando = false;
          }
        });
      } else if (this.ElementoFila) {
        // Cancelar confirmación
        this.ElementoFila.style.transform = 'translateX(0)';
        this.LimpiarArrastre();
      }
    });
  }

  LimpiarArrastre() {
    this.ElementoFila = null;
    this.PedidoArrastrado = null;
  }

  // ------------------- CARGA Y FILTRO -------------------
  CargarPedidos(verOtros: boolean = false) {
    this.Procesando = true;
    this.Cargando = true;
    this.Error = '';

    this.HistorialPedidoServicio.Listado(verOtros).subscribe({
      next: (Respuesta: any) => {
        console.log('Pedidos',Respuesta)
        this.PedidosOriginal = Respuesta.data || [];
        this.FiltrarPedidos();
        this.Cargando = false;
        this.Procesando = false;
      },
      error: () => {
        this.Error = 'Error al cargar los pedidos.';
        this.Cargando = false;
        this.Procesando = false;
      }
    });
  }
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

  // ------------------- AUXILIARES -------------------
  OrdenarPor(campo: string) {

    if (this.CampoOrden === campo) {
      this.Orden = this.Orden === 'asc' ? 'desc' : 'asc';
    } else {
      this.CampoOrden = campo;
      this.Orden = 'asc';
    }

    this.FiltrarPedidos();
  }
  DescargarPDF(CodigoPedido: number) {
    this.Procesando = true;
    this.HistorialPedidoServicio.DescargarPDFPedido(CodigoPedido).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pedido_${CodigoPedido}.pdf`;
        document.body.appendChild(a); // necesario en algunos navegadores
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url); // liberar memoria
        this.Procesando = false;
      },
      error: (err) => {
        console.error('Error al descargar PDF', err);
        this.Procesando = false;
      }
    });
  }
  ObtenerIconoOrden(campo: string) {

    if (this.CampoOrden !== campo) {
      return 'bi-arrow-down-up';
    }

    return this.Orden === 'asc'
      ? 'bi-sort-up'
      : 'bi-sort-down';
  }

  IrARuta(Ruta: string) { this.Router.navigate([Ruta]); }
  IrAGestion(codigo: number) {
    this.Router.navigate(
      ['/pedido-gestion', codigo],
      {
        queryParams: {
          verOtros: this.VerOtros
        }
      }
    );
  }
  IrAVentaImpresion(codigoPedido: number) {

    this.Router.navigate(['/venta-impresion', codigoPedido], {
      queryParams: {
        origen: 'pedido'
      }
    });

  }
  ObtenerRutaMenu(): string {
    if (this.VerOtros) {
      return '/menu-oficial';
    }
    if (this.Roles === 'EMPRESA_OFICIAL') {
      return '/menu';
    }
    if (this.Roles === 'EMPRESA_ASOCIADA') {
      return '/menu-asociada';
    }

    return '/login';
  }
  EsSuperAdmin(): boolean {
    return this.SuperAdmin === 1;
  }

  EsOficial(): boolean {
    return this.Rol === 'EMPRESA_OFICIAL';
  }

  EsAsociada(): boolean {
    return this.Rol === 'EMPRESA_ASOCIADA';
  }
}
