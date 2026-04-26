import { Component } from '@angular/core';
import { ClienteServicio } from '../../../../Servicios/ClienteServicio';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { LoginServicio } from '../../../../Servicios/LoginServicio';

@Component({
  selector: 'app-cliente',
  imports: [CommonModule, FormsModule, SpinnerGlobalComponent],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent {
  Rol: string | null = null;
  Procesando = false;
  Busqueda = '';
  Orden: 'asc' | 'desc' = 'asc';
  ClientesOriginal: any[] = [];
  ClientesFiltrados: any[] = [];
  Error: string | null = null;

  // Arrastre
  Arrastrando = false;
  InicioX = 0;
  UmbralEliminar = 80;
  ClienteArrastrado: any = null;
  ElementoFila: HTMLElement | null = null;

  // Modal
  MensajeEliminarVisible = false;
  MensajeEliminarTexto = '';

  constructor(private ClienteServicio: ClienteServicio,
    private Router: Router,
    private loginServicio: LoginServicio,
    private alerta: AlertaServicio) { }

  ngOnInit() {
    this.Rol = this.loginServicio.ObtenerRol();
    this.CargarClientes();
  }
  ObtenerRutaMenu(): string {
    if (this.Rol === 'EMPRESA_OFICIAL') {
      return '/menu';
    }

    if (this.Rol === 'EMPRESA_ASOCIADA') {
      return '/menu-asociada';
    }

    return '/login';
  }

  // ------------------- ARRASTRE -------------------
  IniciarArrastre(event: any, cliente: any) {
    this.Arrastrando = true;
    this.ClienteArrastrado = cliente;
    this.InicioX = event.touches?.[0].clientX || event.clientX;
    this.ElementoFila = (event.currentTarget as HTMLElement).querySelector('.fila-contenido');
    (event.currentTarget as HTMLElement).classList.add('activa');
  }

  DuranteArrastre(event: any) {
    if (!this.Arrastrando || !this.ElementoFila) return;
    const xActual = event.touches?.[0].clientX || event.clientX;
    this.ElementoFila.style.transform = `translateX(${Math.max(0, xActual - this.InicioX)}px)`;
  }

  FinalizarArrastre() {
    if (!this.Arrastrando || !this.ElementoFila) return;
    const desplazamiento = parseInt(this.ElementoFila.style.transform.replace('translateX(', '')) || 0;
    this.ElementoFila.parentElement?.classList.remove('activa');

    if (desplazamiento > this.UmbralEliminar) {
      // Mostrar confirmación con SweetAlert
      this.EliminarConConfirmacion(this.ClienteArrastrado);
    } else {
      this.ElementoFila.style.transform = 'translateX(0)';
      this.LimpiarArrastre();
    }
    this.Arrastrando = false;
  }
  EliminarConConfirmacion(cliente: any) {
    this.alerta.Confirmacion(
      '¿Eliminar este cliente?',
      `Cliente: ${cliente.NombreCliente}`,
      'Eliminar',
      'Cancelar'
    ).then(confirmado => {
      if (confirmado) {
        this.EliminarCliente(cliente.CodigoCliente);
      } else if (this.ElementoFila) {
        this.ElementoFila.style.transform = 'translateX(0)';
      }
    });
  }
  LimpiarArrastre() {
    this.ElementoFila = null;
    this.ClienteArrastrado = null;
  }

  // ------------------- MODAL -------------------
  MostrarMensajeEliminar(cliente: any, texto: string) {
    this.ClienteArrastrado = cliente;
    this.MensajeEliminarTexto = texto;
    this.MensajeEliminarVisible = true;
  }

  ConfirmarEliminar() {
    if (this.ClienteArrastrado) this.EliminarCliente(this.ClienteArrastrado.CodigoCliente);
    this.CerrarModalEliminar();
  }

  CancelarEliminar() {
    if (this.ElementoFila) this.ElementoFila.style.transform = 'translateX(0)';
    this.CerrarModalEliminar();
    this.LimpiarArrastre();
  }

  CerrarModalEliminar() {
    this.MensajeEliminarVisible = false;
    this.ClienteArrastrado = null;
    this.MensajeEliminarTexto = '';
  }

  EliminarCliente(codigo: number) {
    this.Procesando = true;
    this.ClienteServicio.Eliminar(codigo).subscribe({
      next: () => {
        this.ClientesOriginal = this.ClientesOriginal.filter(c => c.CodigoCliente !== codigo);
        this.FiltrarClientes();
        this.alerta.MostrarExito('Cliente eliminado correctamente');
        this.LimpiarArrastre();
        this.Procesando = false;
      },
      error: (err) => {
        if (this.ElementoFila) {
          this.ElementoFila.style.transform = 'translateX(0)';
        }

        const tipo = err?.error?.tipo;
        const mensaje =
          err?.error?.error?.message ||
          err?.error?.message ||
          'Ocurrió un error inesperado';

        if (tipo === 'Alerta') {
          this.alerta.MostrarAlerta(mensaje);

        }
        else if (tipo === 'Error') {
          this.alerta.MostrarError(err);
        }
        else {
          this.alerta.MostrarError(err);

        }
        this.LimpiarArrastre();
        this.Procesando = false;
      }
    });
  }

  // ------------------- CARGA Y FILTRO -------------------
  CargarClientes() {
    this.Procesando = true;
    this.Error = null;
    this.ClienteServicio.Listado().subscribe({
      next: (res: any) => {
        this.ClientesOriginal = res.data || [];
        this.FiltrarClientes();
        this.Procesando = false;
      },
      error: (err) => {
        const tipo = err?.error?.tipo;
        const mensaje =
          err?.error?.error?.message ||
          err?.error?.message ||
          'Ocurrió un error inesperado';

        if (tipo === 'Alerta') {
          this.alerta.MostrarAlerta(mensaje);
        }
        else if (tipo === 'Error') {
          this.alerta.MostrarError(err);
        }
        else {
          this.alerta.MostrarError(err);
        }

        this.Procesando = false;
      }

    });
  }

  FiltrarClientes() {
    this.ClientesFiltrados = this.ClientesOriginal
      .filter(c => c.NombreCliente?.toLowerCase().includes(this.Busqueda.toLowerCase()))
      .sort((a, b) => this.Orden === 'asc'
        ? a.NombreCliente.toLowerCase().localeCompare(b.NombreCliente.toLowerCase())
        : b.NombreCliente.toLowerCase().localeCompare(a.NombreCliente.toLowerCase())
      );
  }

  // ------------------- AUXILIARES -------------------
  ObtenerIniciales(nombre: string) {
    if (!nombre) return '';
    const palabras = nombre.trim().split(' ');
    return (palabras[0][0] + (palabras[1]?.[0] || '')).toUpperCase();
  }

  CambiarOrden() { this.Orden = this.Orden === 'asc' ? 'desc' : 'asc'; this.FiltrarClientes(); }
  IrARuta(ruta: string) { this.Router.navigate([ruta]); }
  IrAGestion(codigo: number) { this.Router.navigate(['/gestion-cliente', codigo]); }

}
