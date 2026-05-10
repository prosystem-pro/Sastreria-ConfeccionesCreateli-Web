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
  ModoEdicionProducto = false;
  CodigoProductoEditando: number = 0;
  EditandoCatalogo = false;
  TituloFormulario = 'Crear Producto';
  Procesando = false;
  ValorOriginalTipoTela = '';
  ValorOriginalNombreTela = '';

  Inventario: any = {
    Producto: '',
    TipoProducto: 2,
    TipoTela: 0,
    NombreTela: 0,
    Precio: 0
  };

  TipoProductos: any[] = [];
  TipoTelas: any[] = [];
  NombresTelas: any[] = [];
  Productos: any[] = [];

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
    private AlertaServicio: AlertaServicio,
    private route: ActivatedRoute,
  ) { }


  ngOnInit() {
    this.TipoProductos = [
      { CodigoTipoProducto: 2, NombreTipoProducto: 'CONFECCIÓN' }
    ];

    const codigo = this.route.snapshot.paramMap.get('codigoinventario');

    if (codigo) {
      this.ModoEdicionProducto = true;
      this.CodigoProductoEditando = +codigo;
      this.CargarProducto(+codigo);
    }

    this.CargarCatalogos();

    document.addEventListener('click', () => {
      this.CerrarListas();
    });
  }

  CerrarListas() {

    if (this.MostrarListas.TipoTela && !this.Inventario.TipoTela) {
      this.Filtros.TipoTela = this.ValorOriginalTipoTela;
    }

    if (this.MostrarListas.NombreTela && !this.Inventario.NombreTela) {
      this.Filtros.NombreTela = this.ValorOriginalNombreTela;
    }

    this.MostrarListas = {};
  }
  CargarProducto(codigo: number) {

    this.Procesando = true;

    this.ConfiguracionServicio
      .ObtenerInventarioPorCodigo(codigo)
      .subscribe({

        next: (res) => {

          const data = res.data;

          this.Inventario = {
            CodigoProducto: data.CodigoProducto,
            Producto: data.NombreProducto,
            TipoProducto: data.CodigoTipoProducto,
            TipoTela: data.CodigoTipoTela,
            NombreTela: data.CodigoTela,
            Precio: data.Precio
          };

          this.Filtros.TipoTela = data.NombreTipoTela;
          this.Filtros.NombreTela = data.NombreTela;

          this.ValorOriginalTipoTela = data.NombreTipoTela;
          this.ValorOriginalNombreTela = data.NombreTela;

          this.TituloFormulario = 'Editar Producto';
          this.Procesando = false;

        },

        error: (err) => {

          this.AlertaServicio.MostrarError(err);
          this.Procesando = false;

        }

      });

  }
  // ========================
  // CATALOGOS
  // ========================

  CargarCatalogos() {

    this.Procesando = true;

    this.ConfiguracionServicio.ListadoTipoTela().subscribe({

      next: (res) => {

        this.TipoTelas = res.data;

        this.ConfiguracionServicio.ListadoProducto().subscribe({

          next: (res3) => {

            this.Productos = res3.data;
            this.Procesando = false;

            if (this.ModoEdicionProducto && this.Inventario.CodigoProducto) {
              this.Inventario.CodigoProducto =
                Number(this.Inventario.CodigoProducto);
            }

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

  CargarNombresTelaPorTipo(CodigoTipoTela: number) {

    if (!CodigoTipoTela) {
      this.NombresTelas = [];
      return;
    }

    this.ConfiguracionServicio.ListadoTela(CodigoTipoTela)
      .subscribe({

        next: (res) => {

          this.NombresTelas = res.data;

        },

        error: (err) => {

          this.AlertaServicio.MostrarError(err);
          this.NombresTelas = [];

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

    // guardar valor original
    if (tipo === 'TipoTela') {
      this.ValorOriginalTipoTela = this.Filtros.TipoTela;
      this.Filtros.TipoTela = '';
    }

    if (tipo === 'NombreTela') {
      this.ValorOriginalNombreTela = this.Filtros.NombreTela;
      this.Filtros.NombreTela = '';
    }
  }

  Filtrados(key: string, lista: any[], campo: string) {

    const filtro = (this.Filtros[key] || '').toLowerCase();

    return lista.filter(x =>
      x[campo].toLowerCase().includes(filtro)
    );
  }

  Seleccionar(tipo: string, item: any) {

    if (tipo === 'TipoTela') {

      this.Filtros.TipoTela = item.NombreTipoTela;
      this.Inventario.TipoTela = item.CodigoTipoTela;

      this.CargarNombresTelaPorTipo(item.CodigoTipoTela);

      this.MostrarListas.TipoTela = false;
    }

    if (tipo === 'NombreTela') {

      this.Filtros.NombreTela = item.NombreTela;
      this.Inventario.NombreTela = item.CodigoTela;

      this.MostrarListas.NombreTela = false;
    }

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

    if (tipo === 'TipoTela') {
      this.CargarListadoTipoTela();
    }

    if (tipo === 'NombreTela') {
      this.CargarListadoTelaCompleto();
    }

  }
  CargarListadoTelaCompleto() {

    this.Procesando = true;

    this.ConfiguracionServicio
      .ListadoTelaCompleto()
      .subscribe({

        next: (res) => {

          this.ListaCatalogoPanel = res.data;
          this.Procesando = false;

        },

        error: (err) => {

          this.AlertaServicio.MostrarError(err);
          this.ListaCatalogoPanel = [];
          this.Procesando = false;

        }

      });

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

          const tipo = err?.error?.tipo;
          const mensaje =
            err?.error?.error?.message ||
            err?.error?.message ||
            'Ocurrió un error inesperado';

          if (tipo === 'Alerta') {
            this.AlertaServicio.MostrarAlerta(mensaje);
          }
          else if (tipo === 'Error') {
            this.AlertaServicio.MostrarError(err);
          }
          else {
            this.AlertaServicio.MostrarError(err);
          }

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

              const tipo = err?.error?.tipo;
              const mensaje =
                err?.error?.error?.message ||
                err?.error?.message ||
                'Ocurrió un error inesperado';

              if (tipo === 'Alerta') {
                this.AlertaServicio.MostrarAlerta(mensaje);
              }
              else if (tipo === 'Error') {
                this.AlertaServicio.MostrarError(err);
              }
              else {
                this.AlertaServicio.MostrarError(err);
              }

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

              const tipo = err?.error?.tipo;
              const mensaje =
                err?.error?.error?.message ||
                err?.error?.message ||
                'Ocurrió un error inesperado';

              if (tipo === 'Alerta') {
                this.AlertaServicio.MostrarAlerta(mensaje);
              }
              else if (tipo === 'Error') {
                this.AlertaServicio.MostrarError(err);
              }
              else {
                this.AlertaServicio.MostrarError(err);
              }

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
              this.CargarListadoTelaCompleto();
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
              this.CargarListadoTelaCompleto();
              this.Procesando = false;

            },

            error: (err) => {

              const tipo = err?.error?.tipo;
              const mensaje =
                err?.error?.error?.message ||
                err?.error?.message ||
                'Ocurrió un error inesperado';

              if (tipo === 'Alerta') {
                this.AlertaServicio.MostrarAlerta(mensaje);
              }
              else if (tipo === 'Error') {
                this.AlertaServicio.MostrarError(err);
              }
              else {
                this.AlertaServicio.MostrarError(err);
              }

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
        recargar: () => this.CargarListadoTelaCompleto()
      };

    config.servicio(config.codigo).subscribe({

      next: () => {

        this.AlertaServicio.MostrarExito(config.mensaje);
        config.recargar();
        this.Procesando = false;

      },

      error: (err) => {

        const tipo = err?.error?.tipo;
        const mensaje =
          err?.error?.error?.message ||
          err?.error?.message ||
          'Ocurrió un error inesperado';

        if (tipo === 'Alerta') {
          this.AlertaServicio.MostrarAlerta(mensaje);
        }
        else if (tipo === 'Error') {
          this.AlertaServicio.MostrarError(err);
        }
        else {
          this.AlertaServicio.MostrarError(err);
        }

        this.Procesando = false;

      }

    });

  }
  CargarListadoTela(CodigoTipoTela: number) {

    if (!CodigoTipoTela) {
      this.ListaCatalogoPanel = [];
      return;
    }

    const tipo = this.TipoTelas.find(
      t => t.CodigoTipoTela == CodigoTipoTela
    );

    this.ConfiguracionServicio.ListadoTela(CodigoTipoTela)
      .subscribe({

        next: (res) => {

          this.ListaCatalogoPanel = (res.data || []).map((t: any) => ({

            CodigoTela: t.CodigoTela,
            NombreTela: t.NombreTela,
            NombreTipoTela: tipo?.NombreTipoTela || ''

          }));

        },

        error: (err) => {

          this.AlertaServicio.MostrarError(err);
          this.ListaCatalogoPanel = [];

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

    if (!this.Inventario.TipoTela) {
      this.AlertaServicio.MostrarAlerta('Seleccione tipo de tela');
      return;
    }

    if (!this.Inventario.NombreTela) {
      this.AlertaServicio.MostrarAlerta('Seleccione nombre de tela');
      return;
    }

    if (!this.Inventario.Precio) {
      this.AlertaServicio.MostrarAlerta('Ingrese precio');
      return;
    }

    // ======================
    // EDITAR
    // ======================

    if (this.ModoEdicionProducto) {

      if (!this.Inventario.CodigoProducto) {
        this.AlertaServicio.MostrarAlerta('Seleccione producto');
        return;
      }

      const body = {
        CodigoProducto: this.Inventario.CodigoProducto,
        CodigoTipoProducto: this.Inventario.TipoProducto,
        CodigoTipoTela: this.Inventario.TipoTela,
        CodigoTela: this.Inventario.NombreTela,
        Precio: this.Inventario.Precio,
        Stock: 0,
        Estatus: 1
      };

      this.Procesando = true;

      this.ConfiguracionServicio
        .ActualizarProductoInventario(this.CodigoProductoEditando, body)
        .subscribe({

          next: () => {

            this.AlertaServicio.MostrarExito('Producto actualizado correctamente');
            this.Procesando = false;
            this.Router.navigate(['/configuracion-listado']);

          },

          error: (err) => {

            const tipo = err?.error?.tipo;
            const mensaje =
              err?.error?.error?.message ||
              err?.error?.message ||
              'Ocurrió un error inesperado';

            if (tipo === 'Alerta') {
              this.AlertaServicio.MostrarAlerta(mensaje);
            }
            else if (tipo === 'Error') {
              this.AlertaServicio.MostrarError(err);
            }
            else {
              this.AlertaServicio.MostrarError(err);
            }

            this.Procesando = false;

          }

        });

    }

    // ======================
    // CREAR
    // ======================

    else {

      if (!this.Inventario.Producto) {
        this.AlertaServicio.MostrarAlerta('Ingrese producto');
        return;
      }

      const body = {
        CodigoTipoProducto: this.Inventario.TipoProducto,
        CodigoTipoTela: this.Inventario.TipoTela,
        CodigoTela: this.Inventario.NombreTela,
        NombreProducto: this.Inventario.Producto,
        Precio: this.Inventario.Precio
      };

      this.Procesando = true;

      this.ConfiguracionServicio
        .CrearProductoInventario(body)
        .subscribe({

          next: () => {

            this.AlertaServicio.MostrarExito('Producto creado correctamente');
            this.Procesando = false;
            this.Router.navigate(['/configuracion-listado']);

          },

          error: (err) => {

            const tipo = err?.error?.tipo;
            const mensaje =
              err?.error?.error?.message ||
              err?.error?.message ||
              'Ocurrió un error inesperado';

            if (tipo === 'Alerta') {
              this.AlertaServicio.MostrarAlerta(mensaje);
            }
            else if (tipo === 'Error') {
              this.AlertaServicio.MostrarError(err);
            }
            else {
              this.AlertaServicio.MostrarError(err);
            }

            this.Procesando = false;

          }

        });

    }

  }

  IrARuta(ruta: string) {
    this.Router.navigate([ruta]);
  }
  NormalizarTextoCatalogo(event: any) {

    if (!this.NombreNuevoCatalogo) return;

    let texto = this.NombreNuevoCatalogo;

    // 1. SOLO letras y espacios (aquí estaba el error antes)
    texto = texto.replace(/[^a-zA-Z\s]/g, '');

    // 2. evitar múltiples espacios
    texto = texto.replace(/\s+/g, ' ').trimStart(); // 👈 importante NO usar solo trim()

    // 3. Title Case (cada palabra inicia en mayúscula)
    texto = texto.toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());

    this.NombreNuevoCatalogo = texto;

    // 4. sincronizar visualmente input
    if (event?.target) {
      event.target.value = texto;
    }
  }
  NormalizarTextoCatalogoProducto(event: any) {

    let valor = event.target.value || '';

    // 1. solo letras y espacios (en tiempo real)
    valor = valor.replace(/[^a-zA-Z\s]/g, '');

    // 2. espacios limpios
    valor = valor.replace(/\s+/g, ' ');

    // 3. title case
    valor = valor.toLowerCase()
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

    // 4. asignar directamente al input (SIN esperar ngModel sync)
    event.target.value = valor;

    // 5. sincronizar modelo angular sin delay visible
    this.Inventario.Producto = valor;
  }
}
