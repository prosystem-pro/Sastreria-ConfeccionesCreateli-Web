import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConfiguracionServicio } from '../../../../Servicios/ConfiguracionServicio';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-configuracion-gestion',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SpinnerGlobalComponent],
  templateUrl: './configuracion-gestion.component.html',
  styleUrl: './configuracion-gestion.component.css'
})
export class ConfiguracionGestionComponent {
  EditandoCatalogo = false;
  TituloFormulario = 'Crear Producto';
  Procesando = false;

  Inventario: any = {
    Producto: '',
    TipoProducto: 1,
    TipoTela: 0,
    NombreTela: 0,
    Precio: 0
  };

  TipoProductos: any[] = [];
  TipoTelas: any[] = [];
  NombresTelas: any[] = [];

  MostrarListas: any = {};
  Filtros: any = {};

  PanelCatalogoActivo: string | null = null;

  NombreNuevoCatalogo = '';
  ListaCatalogoPanel: any[] = [];
  CodigoTipoTelaSeleccionado = 0;

  ModoEdicion = false;
  CodigoEditando: number = 0;

  constructor(
    private ConfiguracionServicio: ConfiguracionServicio,
    private Router: Router,
    private AlertaServicio: AlertaServicio
  ) { }


  ngOnInit() {

    this.TipoProductos = [
      { CodigoTipoProducto: 1, NombreTipoProducto: 'CONFECCIÓN' }
    ];

    this.CargarCatalogos();

    document.addEventListener('click', () => {
      this.CerrarListas();
    });

  }
  CerrarListas() {
    this.MostrarListas = {};
  }

  // ========================
  // CATALOGOS
  // ========================

  CargarCatalogos() {

    this.Procesando = true;

    this.ConfiguracionServicio
      .ListadoTipoTela()
      .subscribe({

        next: (res) => {
          this.TipoTelas = res.data;

          this.ConfiguracionServicio
            .ListadoTela()
            .subscribe({

              next: (res2) => {

                this.NombresTelas = res2.data;
                this.Procesando = false;

              },

              error: (err) => {

                this.AlertaServicio.MostrarError(err);
                this.Procesando = false;

              }

            });

        },

        error: (err) => {

          this.AlertaServicio.MostrarError(err);
          this.Procesando = false;

        }

      });

  }
  // ========================
  // BUSCADOR
  // ========================

  AlternarListaBusqueda(tipo: string, e: Event) {

    e.stopPropagation();

    this.MostrarListas = {};
    this.MostrarListas[tipo] = true;

  }

  Filtrados(key: string, lista: any[], campo: string) {

    const filtro = (this.Filtros[key] || '').toLowerCase();

    return lista.filter(x =>
      x[campo].toLowerCase().includes(filtro)
    );
  }

  Seleccionar(tipo: string, item: any) {

    if (tipo === 'TipoTela') {
      this.Inventario.TipoTela = item.CodigoTipoTela;
      this.Filtros.TipoTela = item.NombreTipoTela;
    }

    if (tipo === 'NombreTela') {
      this.Inventario.NombreTela = item.CodigoTela;
      this.Filtros.NombreTela = item.NombreTela;
    }

    this.MostrarListas[tipo] = false;
  }

  // ========================
  // PANEL
  // ========================

  AgregarNuevo(tipo: string) {

    this.PanelCatalogoActivo = tipo;
    this.NombreNuevoCatalogo = '';
    this.ModoEdicion = false;
    this.EditandoCatalogo = false;
    this.CodigoEditando = 0;
    this.CodigoTipoTelaSeleccionado = 0;

    if (tipo === 'TipoTela')
      this.CargarListadoTipoTela();

    if (tipo === 'NombreTela')
      this.CargarListadoTela();
  }

  CerrarPanel() {

    this.PanelCatalogoActivo = null;
    this.ResetCatalogo();
    this.CargarCatalogos();

  }
  CargarListadoTipoTela() {

    this.Procesando = true;

    this.ConfiguracionServicio
      .ListadoTipoTela()
      .subscribe({

        next: (res) => {

          this.ListaCatalogoPanel = res.data;
          this.Procesando = false;

        },

        error: (err) => {

          this.AlertaServicio.MostrarError(err);
          this.Procesando = false;

        }

      });

  }

  CargarListadoTela() {

    this.Procesando = true;

    this.ConfiguracionServicio
      .ListadoTela()
      .subscribe({

        next: (res) => {

          this.ListaCatalogoPanel = res.data;
          this.Procesando = false;

        },

        error: (err) => {

          this.AlertaServicio.MostrarError(err);
          this.Procesando = false;

        }

      });

  }

  // ========================
  // GUARDAR / EDITAR
  // ========================

  GuardarCatalogo() {

    if (!this.NombreNuevoCatalogo) {
      this.AlertaServicio.MostrarAlerta('Ingrese nombre');
      return;
    }

    // =========================
    // TIPO TELA
    // =========================

    if (this.PanelCatalogoActivo === 'TipoTela') {

      this.Procesando = true;

      if (this.ModoEdicion) {

        this.ConfiguracionServicio
          .EditarTipoTela(
            this.CodigoEditando,
            { NombreTipoTela: this.NombreNuevoCatalogo }
          )
          .subscribe({

            next: () => {

              this.AlertaServicio.MostrarExito('Tipo de tela actualizado correctamente');

              this.ResetCatalogo();
              this.CargarListadoTipoTela();
              this.Procesando = false;

            },

            error: (err) => {

              this.AlertaServicio.MostrarError(err);
              this.Procesando = false;

            }

          });

      } else {

        this.ConfiguracionServicio
          .CrearTipoTela(
            { NombreTipoTela: this.NombreNuevoCatalogo }
          )
          .subscribe({

            next: () => {

              this.AlertaServicio.MostrarExito('Tipo de tela creado correctamente');

              this.ResetCatalogo();
              this.CargarListadoTipoTela();
              this.Procesando = false;

            },

            error: (err) => {

              this.AlertaServicio.MostrarError(err);
              this.Procesando = false;

            }

          });

      }
    }

    // =========================
    // NOMBRE TELA
    // =========================

    if (this.PanelCatalogoActivo === 'NombreTela') {

      if (this.CodigoTipoTelaSeleccionado === 0) {
        this.AlertaServicio.MostrarAlerta('Seleccione tipo de tela');
        return;
      }

      this.Procesando = true;

      if (this.ModoEdicion) {

        this.ConfiguracionServicio
          .EditarTela(
            this.CodigoEditando,
            {
              CodigoTipoTela: this.CodigoTipoTelaSeleccionado,
              NombreTela: this.NombreNuevoCatalogo
            }
          )
          .subscribe({

            next: () => {

              this.AlertaServicio.MostrarExito('Tela actualizada correctamente');

              this.ResetCatalogo();
              this.CargarListadoTela();
              this.Procesando = false;

            },

            error: (err) => {

              this.AlertaServicio.MostrarError(err);
              this.Procesando = false;

            }

          });

      } else {

        this.ConfiguracionServicio
          .CrearTela({
            CodigoTipoTela: this.CodigoTipoTelaSeleccionado,
            NombreTela: this.NombreNuevoCatalogo
          })
          .subscribe({

            next: () => {

              this.AlertaServicio.MostrarExito('Tela creada correctamente');

              this.ResetCatalogo();
              this.CargarListadoTela();
              this.Procesando = false;

            },

            error: (err) => {

              this.AlertaServicio.MostrarError(err);
              this.Procesando = false;

            }

          });

      }
    }

  }
  IniciarArrastreCatalogo(event: any, item: any) {

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
        parseInt(
          content.style.transform
            .replace('translateX(', '')
            .replace('px)', '')
        ) || 0;

      content.style.transform = `translateX(0)`;

      if (transformX > 60) {

        const nombre = this.PanelCatalogoActivo === 'TipoTela'
          ? item.NombreTipoTela
          : item.NombreTela;

        this.AlertaServicio
          .Confirmacion(
            'Confirmar eliminación',
            `¿Desea eliminar "${nombre}"?`,
            'Eliminar',
            'Cancelar'
          )
          .then(confirmado => {

            if (confirmado) {
              this.EliminarCatalogo(item);
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
  EliminarCatalogo(item: any) {

    this.Procesando = true;

    const config = this.PanelCatalogoActivo === 'TipoTela'
      ? {
        servicio: this.ConfiguracionServicio.EliminarTipoTela.bind(this.ConfiguracionServicio),
        codigo: item.CodigoTipoTela,
        mensaje: 'Tipo de tela eliminado',
        recargar: () => this.CargarListadoTipoTela()
      }
      : {
        servicio: this.ConfiguracionServicio.EliminarTela.bind(this.ConfiguracionServicio),
        codigo: item.CodigoTela,
        mensaje: 'Tela eliminada',
        recargar: () => this.CargarListadoTela()
      };

    config.servicio(config.codigo).subscribe({

      next: () => {

        this.AlertaServicio.MostrarExito(config.mensaje);
        config.recargar();
        this.Procesando = false;

      },

      error: (err) => {

        this.AlertaServicio.MostrarError(err);
        this.Procesando = false;

      }

    });

  }
  EditarCatalogo(item: any) {

    this.ModoEdicion = true;
    this.EditandoCatalogo = true;

    if (this.PanelCatalogoActivo === 'TipoTela') {

      this.CodigoEditando = item.CodigoTipoTela;
      this.NombreNuevoCatalogo = item.NombreTipoTela;

    }

    if (this.PanelCatalogoActivo === 'NombreTela') {

      this.CodigoEditando = item.CodigoTela;
      this.NombreNuevoCatalogo = item.NombreTela;
      this.CodigoTipoTelaSeleccionado = item.CodigoTipoTela;

    }
  }


  ResetCatalogo() {

    this.NombreNuevoCatalogo = '';
    this.ModoEdicion = false;
    this.EditandoCatalogo = false;
    this.CodigoEditando = 0;
    this.CodigoTipoTelaSeleccionado = 0;

  }

  NombreCatalogo(item: any) {

    if (this.PanelCatalogoActivo === 'TipoTela')
      return item.NombreTipoTela;

    return item.NombreTela;
  }

  // ========================
  // PRODUCTO
  // ========================

  Guardar() {

    this.Procesando = true;

    this.ConfiguracionServicio
      .CrearProductoInventario(this.Inventario)
      .subscribe({

        next: () => {

          this.AlertaServicio.MostrarExito('Producto creado correctamente');
          this.Procesando = false;
          this.Router.navigate(['/inventario-listado']);

        },

        error: (err) => {

          this.AlertaServicio.MostrarError(err);
          this.Procesando = false;

        }

      });

  }

  IrARuta(ruta: string) {
    this.Router.navigate([ruta]);
  }

}
