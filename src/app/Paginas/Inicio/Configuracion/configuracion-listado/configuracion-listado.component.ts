import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfiguracionServicio } from '../../../../Servicios/ConfiguracionServicio';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuracion-listado',
  imports: [FormsModule, CommonModule, SpinnerGlobalComponent],
  templateUrl: './configuracion-listado.component.html',
  styleUrl: './configuracion-listado.component.css'
})
export class ConfiguracionListadoComponent implements OnInit{
InventarioOriginal: any[] = [];
  InventarioFiltrado: any[] = [];

  Busqueda: string = '';
  CampoOrden: string = 'Producto';
  Orden: 'asc' | 'desc' = 'asc';

  Seleccionados: number[] = [];

  Error: string = '';
  Procesando: boolean = false;
  MostrandoEliminados: boolean = false;

  constructor(
    private ConfiguracionServicio: ConfiguracionServicio,
    private router: Router,
    private alertaServicio: AlertaServicio
  ) { }

  ngOnInit(): void {
    this.CargarInventario();
  }

  CargarInventario() {
    this.Procesando = true;
    this.Error = '';

    const observable = this.MostrandoEliminados
      ? this.ConfiguracionServicio.ObtenerInventarioEliminados(1)
      : this.ConfiguracionServicio.ObtenerInventarioListado(1);

    observable.subscribe({
      next: (resp) => {
        this.InventarioOriginal = resp.data || [];
        this.FiltrarInventario();
        this.Procesando = false;
      },
      error: (err) => {
        this.Error = 'Error al cargar el inventario';
        this.Procesando = false;
        console.error(err);
      }
    });
  }
  FiltrarInventario() {

    this.InventarioFiltrado = this.InventarioOriginal
      .filter(item => {

        const texto = this.Busqueda.toLowerCase();

        return (
          item.Producto?.toLowerCase().includes(texto) ||
          item.Marca?.toLowerCase().includes(texto) ||
          item.CodigoBarra?.toLowerCase().includes(texto) ||
          item.Color?.toLowerCase().includes(texto) ||
          item.Talla?.toLowerCase().includes(texto)
        );

      })
      .sort((a, b) => {

        let valorA = a[this.CampoOrden];
        let valorB = b[this.CampoOrden];

        if (
          this.CampoOrden === 'Producto' ||
          this.CampoOrden === 'Marca'
        ) {
          valorA = valorA?.toLowerCase() || '';
          valorB = valorB?.toLowerCase() || '';
        }

        if (valorA > valorB) return this.Orden === 'asc' ? 1 : -1;
        if (valorA < valorB) return this.Orden === 'asc' ? -1 : 1;
        return 0;

      });

  }
  OrdenarPor(campo: string) {

    if (this.CampoOrden === campo) {
      this.Orden = this.Orden === 'asc' ? 'desc' : 'asc';
    } else {
      this.CampoOrden = campo;
      this.Orden = 'asc';
    }

    this.FiltrarInventario();
  }
  ObtenerIconoOrden(campo: string) {

    if (this.CampoOrden !== campo)
      return 'bi-arrow-down-up';

    return this.Orden === 'asc'
      ? 'bi-sort-up'
      : 'bi-sort-down';
  }
  // Métodos para alternar vistas
  MostrarEliminados() {
    this.MostrandoEliminados = true;
    this.CargarInventario();
  }

  MostrarActivos() {
    this.MostrandoEliminados = false;
    this.CargarInventario();
  }

  IniciarArrastre(event: any, index: number) {
    if (this.MostrandoEliminados) return; // no permitir eliminar en eliminados
    event.preventDefault();
    const startX = event.type.startsWith('touch') ? event.touches[0].clientX : event.clientX;
    const content = event.currentTarget;

    const mover = (moveEvent: any) => {
      const clientX = moveEvent.type.startsWith('touch') ? moveEvent.touches[0].clientX : moveEvent.clientX;
      let dx = clientX - startX;
      if (dx < 0) dx = 0;
      if (dx > 80) dx = 80;
      content.style.transform = `translateX(${dx}px)`;
    };

    const soltar = () => {
      const transformX = parseInt(content.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
      content.style.transform = `translateX(0)`;
      if (transformX > 60) {
        const producto = this.InventarioFiltrado[index].Producto;
        // USAR ALERTA DE CONFIRMACIÓN
        this.alertaServicio.Confirmacion(
          'Confirmar eliminación',
          `¿Desea eliminar el producto "${producto}"?`,
          'Eliminar',
          'Cancelar'
        ).then(confirmed => {
          if (confirmed) {
            this.ConfirmarEliminar(index);
          }
        });
      }

      window.removeEventListener('mousemove', mover);
      window.removeEventListener('mouseup', soltar);
      window.removeEventListener('touchmove', mover);
      window.removeEventListener('touchend', soltar);
    };

    window.addEventListener('mousemove', mover);
    window.addEventListener('mouseup', soltar);
    window.addEventListener('touchmove', mover);
    window.addEventListener('touchend', soltar);
  }

ConfirmarEliminar(index: number) {

  const CodigoInventario = this.InventarioFiltrado[index].CodigoInventario;
  const producto = this.InventarioFiltrado[index].Producto;

  this.EliminarRegistro(
    CodigoInventario,
    producto,
    this.ConfiguracionServicio.EliminarInventario.bind(this.ConfiguracionServicio),
    this.InventarioOriginal,
    'CodigoInventario',
    'Producto'
  );

}

  ToggleSeleccion(CodigoInventario: number, event: any) {
    if (event.target.checked) {
      if (!this.Seleccionados.includes(CodigoInventario)) {
        this.Seleccionados.push(CodigoInventario);
      }
    } else {
      this.Seleccionados = this.Seleccionados.filter(c => c !== CodigoInventario);
    }
  }

  RestaurarSeleccionadosConfirmacion() {
    if (this.Seleccionados.length === 0) {
      // Si no hay selección, mostramos alerta de advertencia
      this.alertaServicio.MostrarAlerta('Seleccione al menos un producto para restaurar.');
      return;
    }

    // Confirmación de restauración
    this.alertaServicio.Confirmacion(
      'Confirmar restauración',
      `¿Desea restaurar ${this.Seleccionados.length} producto(s)?`,
      'Restaurar',
      'Cancelar'
    ).then(confirmed => {
      if (confirmed) {
        this.Procesando = true;
        this.ConfiguracionServicio.RestaurarInventario(this.Seleccionados)
          .subscribe({
            next: (resp) => {
              // Limpiar selección
              this.Seleccionados = [];
              // Recargar inventario (mostrando eliminados)
              this.CargarInventario();
              // Mostrar alerta de éxito
              this.alertaServicio.MostrarExito(resp.mensaje || 'Productos restaurados correctamente');
            },
            error: (err) => {
              this.alertaServicio.MostrarError(err, 'Error al restaurar productos');
            },
            complete: () => {
              this.Procesando = false;
            }
          });
      }
    });
  }

  IrRuta(ruta: string) {
    this.router.navigate([ruta]);
  }

  AbrirInventarioGestion(CodigoInventario: number) {
    // Redirige pasando el código como parámetro en la ruta
    this.router.navigate(['/inventario-gestion', CodigoInventario]);
  }

  EliminarRegistro(
  codigo: number,
  nombre: string,
  servicioEliminar: any,
  lista: any[],
  campoCodigo: string,
  mensaje: string
) {

  this.Procesando = true;

  servicioEliminar(codigo).subscribe({

    next: () => {

      this.InventarioOriginal =
        this.InventarioOriginal.filter(
          item => item[campoCodigo] !== codigo
        );

      this.FiltrarInventario();

      this.alertaServicio.MostrarExito(
        `${mensaje} "${nombre}" eliminado correctamente`
      );
    },

    error: (err: any) => {
      this.alertaServicio.MostrarError(err, 'Error al eliminar');
    },

    complete: () => {
      this.Procesando = false;
    }

  });

}
}
