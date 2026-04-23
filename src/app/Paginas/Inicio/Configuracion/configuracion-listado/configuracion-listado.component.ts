import { Component, OnInit, ViewChildren, QueryList, ElementRef, Renderer2, AfterViewInit, OnDestroy } from '@angular/core';
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
export class ConfiguracionListadoComponent implements OnInit {
  ProductoExpandido: number | null = null;
  InventarioOriginal: any[] = [];
  InventarioFiltrado: any[] = [];
  NuevaVariacion: any[] = [];
  TiposTela: { CodigoTipoTela: number; NombreTipoTela: string }[] = [];
  Telas: { CodigoTela: number; NombreTela: string }[] = [];
  @ViewChildren('productoCard') productoCards!: QueryList<ElementRef>;
  private clickListener!: () => void;
  Busqueda: string = '';

  Seleccionados: number[] = [];

  Error: string = '';
  Procesando: boolean = false;
  MostrandoEliminados: boolean = false;

  constructor(
    private ConfiguracionServicio: ConfiguracionServicio,
    private router: Router,
    private alertaServicio: AlertaServicio,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.CargarInventario();
  }

  ngAfterViewInit() {
    this.clickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
      this.cerrarSiClickFuera(event);
    });
  }
  cerrarSiClickFuera(event: MouseEvent) {
    // Si no hay producto expandido, no hacemos nada
    if (this.ProductoExpandido === null) return;

    let clicDentro = false;

    this.productoCards.forEach((card, index) => {
      if (index === this.ProductoExpandido) {
        if (card.nativeElement.contains(event.target)) {
          clicDentro = true;
        }
      }
    });

    // Si el clic fue fuera, cerramos
    if (!clicDentro) {
      this.ProductoExpandido = null;
    }
  }
  ngOnDestroy() {
    if (this.clickListener) this.clickListener();
  }
  ToggleProducto(index: number) {
    this.ProductoExpandido = this.ProductoExpandido === index ? null : index;
  }
  CargarInventario() {

    this.Procesando = true;
    this.Error = '';

    const observable = this.MostrandoEliminados
      ? this.ConfiguracionServicio.ObtenerInventarioEliminados(1)
      : this.ConfiguracionServicio.ObtenerInventarioListado(1);

    observable.subscribe({

      next: (resp) => {

        const data = resp.data || [];

        // 🔹 Filtrar productos que sí tengan variaciones válidas
        this.InventarioOriginal = data
          .map((p: any) => ({
            ...p,
            Variaciones: (p.Variaciones || []).filter(
              (v: any) =>
                v &&
                v.CodigoInventario &&
                v.TipoTela &&
                v.Tela
            )
          }))
          .filter((p: any) => p.Variaciones.length > 0);

        this.FiltrarInventario();
        this.InicializarNuevaVariacion();
        this.CargarTiposTela();

        this.ProductoExpandido = null;
        this.Procesando = false;

      },

      error: (err) => {

        this.Error = 'Error al cargar el inventario';
        this.Procesando = false;
        console.error(err);

      }

    });

  }
  InicializarNuevaVariacion() {

    this.NuevaVariacion = this.InventarioFiltrado.map(() => ({
      TipoTela: '',
      Tela: '',
      Precio: ''
    }));

  }
  AgregarVariacion(index: number) {
    const nueva = this.NuevaVariacion[index];

    // Validación de campos
    if (!nueva.TipoTela || !nueva.Tela || !nueva.Precio) {
      this.alertaServicio.MostrarAlerta('Complete los campos');
      return;
    }

    const producto = this.InventarioFiltrado[index];

    const payload = {
      CodigoProducto: producto.CodigoProducto,
      CodigoTipoProducto: 2,
      CodigoTipoTela: nueva.TipoTela,
      CodigoTela: nueva.Tela,
      Precio: nueva.Precio
    };

    this.Procesando = true;

    this.ConfiguracionServicio.CrearVariacionInventario(payload).subscribe({
      next: (resp: any) => {
        // Asumimos que resp.Inventario contiene la variación recién creada con CodigoInventario
        producto.Variaciones.push({
          TipoTela: nueva.TipoTela,
          Tela: nueva.Tela,
          Precio: nueva.Precio,
          CodigoInventario: resp?.Inventario?.CodigoInventario || 0
        });

        // Limpiar campos
        this.NuevaVariacion[index] = {
          TipoTela: '',
          Tela: '',
          Precio: ''
        };

        this.alertaServicio.MostrarExito('Variación agregada correctamente');
        this.CargarInventario();
      },
      error: (err: any) => {
        const tipo = err?.error?.tipo;
        const mensaje =
          err?.error?.error?.message ||
          err?.error?.message ||
          'Ocurrió un error inesperado';

        if (tipo === 'Alerta') {
          this.alertaServicio.MostrarAlerta(mensaje);
        }
        else if (tipo === 'Error') {
          this.alertaServicio.MostrarError(err);
        }
        else {
          this.alertaServicio.MostrarError(err);
        }

        this.Procesando = false;
      },
      complete: () => {
        this.Procesando = false;
      }
    });
  }

  FiltrarInventario() {

    const texto = this.Busqueda.toLowerCase();

    this.InventarioFiltrado = this.InventarioOriginal
      .filter(item =>
        item.Producto?.toLowerCase().includes(texto)
      )
      .filter(item =>
        item.Variaciones && item.Variaciones.length > 0
      );

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

  IniciarArrastre(event: any, productoIndex: number, variacionIndex: number) {

    if (this.MostrandoEliminados) return;

    event.preventDefault();

    const startX = event.type.startsWith('touch')
      ? event.touches[0].clientX
      : event.clientX;

    const content = event.currentTarget;

    const mover = (moveEvent: any) => {

      const clientX = moveEvent.type.startsWith('touch')
        ? moveEvent.touches[0].clientX
        : moveEvent.clientX;

      let dx = clientX - startX;

      if (dx < 0) dx = 0;
      if (dx > 80) dx = 80;

      content.style.transform = `translateX(${dx}px)`;
    };

    const soltar = () => {

      const transformX =
        parseInt(content.style.transform.replace('translateX(', '').replace('px)', '')) || 0;

      content.style.transform = `translateX(0)`;

      if (transformX > 60) {

        const variacion =
          this.InventarioFiltrado[productoIndex].Variaciones[variacionIndex];

        const producto =
          this.InventarioFiltrado[productoIndex].Producto;

        this.alertaServicio.Confirmacion(
          'Confirmar eliminación',
          `¿Desea eliminar la variación de "${producto}"?`,
          'Eliminar',
          'Cancelar'
        ).then(confirmed => {

          if (confirmed) {

            this.ConfirmarEliminar(
              variacion.CodigoInventario,
              producto,
              productoIndex,
              variacionIndex
            );

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

  ConfirmarEliminar(
    CodigoInventario: number,
    producto: string,
    productoIndex: number,
    variacionIndex: number
  ) {

    this.Procesando = true;

    this.ConfiguracionServicio.EliminarInventario(CodigoInventario)
      .subscribe({

        next: () => {

          this.InventarioOriginal[productoIndex].Variaciones.splice(variacionIndex, 1);

          if (this.InventarioOriginal[productoIndex].Variaciones.length === 0) {
            this.InventarioOriginal.splice(productoIndex, 1);
          }

          this.FiltrarInventario();

          this.alertaServicio.MostrarExito(
            `Variación de "${producto}" eliminada correctamente`
          );

        },

        error: (err: any) => {
          this.alertaServicio.MostrarError(err);
        },

        complete: () => {
          this.Procesando = false;
        }

      });

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
              this.alertaServicio.MostrarExito('Productos restaurados correctamente');
            },
            error: (err) => {
              const tipo = err?.error?.tipo;
              const mensaje =
                err?.error?.error?.message ||
                err?.error?.message ||
                'Ocurrió un error inesperado';

              if (tipo === 'Alerta') {
                this.alertaServicio.MostrarAlerta(mensaje);
              }
              else if (tipo === 'Error') {
                this.alertaServicio.MostrarError(err);
              }
              else {
                this.alertaServicio.MostrarError(err);
              }

              this.Procesando = false;
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
    this.router.navigate(['/configuracion-gestion', CodigoInventario]);

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

  CargarTiposTela() {
    this.ConfiguracionServicio.ListadoTipoTela().subscribe({
      next: (resp: any) => {
        this.TiposTela = resp?.data?.map((t: any) => ({
          CodigoTipoTela: t.CodigoTipoTela,
          NombreTipoTela: t.NombreTipoTela
        })) || [];
      },
      error: (err) => {
        console.error('Error al cargar tipos de tela:', err);
        this.TiposTela = [];
      }
    });
  }


  CargarTelasPorTipo(CodigoTipoTela: number) {

    if (!CodigoTipoTela) {
      this.Telas = [];
      return;
    }

    this.ConfiguracionServicio.ListadoTela(CodigoTipoTela)
      .subscribe({
        next: (resp: any) => {

          this.Telas = resp?.data?.map((t: any) => ({
            CodigoTela: t.CodigoTela,
            NombreTela: t.NombreTela
          })) || [];

        },
        error: (err) => {
          console.error('Error al cargar telas:', err);
          this.Telas = [];
        }
      });

  }


}
