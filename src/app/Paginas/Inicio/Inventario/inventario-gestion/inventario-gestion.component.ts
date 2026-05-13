import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InventarioServicio } from '../../../../Servicios/InventarioServicio';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';

@Component({
  selector: 'app-inventario-gestion',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SpinnerGlobalComponent],
  templateUrl: './inventario-gestion.component.html',
  styleUrl: './inventario-gestion.component.css'
})
export class InventarioGestionComponent {
  BusquedaTipoProducto: any;
  ModoEdicion = false;
  CodigoCatalogoEditando: number | null = null;
  NombreNuevoCatalogo: string = '';
  ListaCatalogoPanel: any[] = [];
  PanelCatalogoActivo: string | null = null;
  TituloFormulario: string = 'Crear Producto';
  Procesando = false;

  Inventario: any = {
    Producto: '',
    TipoProducto: 0,
    Marca: 0,
    Diseño: 0,
    CodigoBarra: '',
    Talla: 0,
    Color: 0,
    Precio: 0,
    Stock: 0,
    Estatus: 1,
    EstatusSwitch: true
  };

  TipoProductos: any[] = [];
  Marcas: any[] = [];
  Estilos: any[] = [];
  Tallas: any[] = [];
  Colores: any[] = [];

  MostrarListas: any = {};
  Filtros: any = {};

  constructor(
    private InventarioServicio: InventarioServicio,
    private Router: Router,
    private route: ActivatedRoute,
    private AlertaServicio: AlertaServicio,
  ) { }

  ngOnInit() {
    this.CargarCatalogo('TipoProductos', this.InventarioServicio.ListadoTipoProducto());
    this.CargarCatalogo('Marcas', this.InventarioServicio.ListadoMarca());
    this.CargarCatalogo('Estilos', this.InventarioServicio.ListadoEstilo());
    this.CargarCatalogo('Tallas', this.InventarioServicio.ListadoTalla());
    this.CargarCatalogo('Colores', this.InventarioServicio.ListadoColor());

    const CodigoInventario = this.route.snapshot.paramMap.get('CodigoInventario');
    if (CodigoInventario) {
      this.TituloFormulario = 'Editar Producto';
      this.CargarInventario(CodigoInventario);
    } else {
      this.TituloFormulario = 'Crear Producto';
    }


  }

  CargarInventario(CodigoInventario: string) {

    this.Procesando = true;

    this.InventarioServicio
      .ObtenerInventarioPorCodigo(Number(CodigoInventario))
      .subscribe({

        next: (respuesta) => {

          const data = respuesta.data;

          // PRODUCTO
          this.Inventario.Producto = data.Producto;
          this.Inventario.CodigoProducto = data.CodigoProducto || 0;
          this.Inventario.CodigoInventario = data.CodigoInventario || 0;

          // TIPO PRODUCTO
          this.Inventario.TipoProducto = data.CodigoTipoProducto || 0;
          this.Inventario.TipoProductoNombreCodigo = data.CodigoTipoProducto || 0;
          this.Filtros['TipoProducto'] = data.TipoProducto || '';

          // MARCA
          this.Inventario.Marca = data.CodigoMarca || 0;
          this.Inventario.MarcaNombreCodigo = data.CodigoMarca || 0;
          this.Filtros['Marca'] = data.Marca || '';

          // ESTILO
          this.Inventario.Diseño = data.CodigoEstilo || 0;
          this.Inventario.EstiloNombreCodigo = data.CodigoEstilo || 0;
          this.Filtros['Estilo'] = data.Diseno || '';

          // CODIGO BARRA
          this.Inventario.CodigoBarra = data.CodigoBarra || '';

          // TALLA
          this.Inventario.Talla = data.CodigoTalla || 0;
          this.Inventario.TallaNombreCodigo = data.CodigoTalla || 0;
          this.Filtros['Talla'] = data.Talla || '';

          // COLOR
          this.Inventario.Color = data.CodigoColor || 0;
          this.Inventario.ColorNombreCodigo = data.CodigoColor || 0;
          this.Filtros['Color'] = data.Color || '';

          // PRECIO Y STOCK
          this.Inventario.Precio = data.PrecioVenta || 0;
          this.Inventario.Stock = data.StockActual || 0;
          // ESTATUS
          this.Inventario.Estatus = data.Estatus || 1;
          this.Inventario.EstatusSwitch = this.Inventario.Estatus === 1;

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
  CargarCatalogo(
    propiedad: 'TipoProductos' | 'Marcas' | 'Estilos' | 'Tallas' | 'Colores',
    observable: any
  ) {
    observable.subscribe({
      next: (res: any) => {
        this[propiedad] = res.data || [];

        if (propiedad === 'TipoProductos' && this[propiedad].length > 0) {
          // Selección automática de FISICO
          const seleccionado = this[propiedad].find(tp => tp.NombreTipoProducto === 'FISICO') || this[propiedad][0];

          this.Filtros['TipoProducto'] = seleccionado.NombreTipoProducto;
          this.Inventario.TipoProducto = seleccionado.CodigoTipoProducto; // <- clave
        }

      },
      error: () => this[propiedad] = []
    });
  }


  AlternarListaBusqueda(key: string, event: Event) {
    event.stopPropagation();
    const abierta = this.MostrarListas[key];
    if (!abierta) this.Filtros[key] = '';
    this.MostrarListas[key] = !abierta;
  }

  Filtrados(key: string, lista: any[], campoNombre: string) {

    const filtro = (this.Filtros[key] || '').toLowerCase();

    if (!filtro) return lista;

    return lista.filter(item =>
      (item[campoNombre] ?? '').toLowerCase().includes(filtro)
    );
  }
  Seleccionar(
    tipo: 'TipoProducto' | 'Marca' | 'Estilo' | 'Talla' | 'Color',
    item: any
  ) {

    const mapa: any = {
      TipoProducto: ['CodigoTipoProducto', 'NombreTipoProducto'],
      Marca: ['CodigoMarca', 'NombreMarca'],
      Estilo: ['CodigoEstilo', 'NombreEstilo'],
      Talla: ['CodigoTalla', 'NombreTalla'],
      Color: ['CodigoColor', 'NombreColor']
    };

    const [codigo, nombre] = mapa[tipo];

    const campoInventario = tipo === 'Estilo' ? 'Diseño' : tipo;

    this.Inventario[campoInventario] = Number(item[codigo] || 0);

    this.Filtros[tipo] = item[nombre];

    this.Inventario[campoInventario + 'NombreCodigo'] = Number(item[codigo] || 0);

    this.MostrarListas[tipo] = false;
  }


  CerrarListasExternas(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Si el clic es dentro de un input-group, no cerramos
    if (target.closest('.input-group')) return;

    // Cerramos todos los desplegables
    Object.keys(this.MostrarListas).forEach(key => this.MostrarListas[key] = false);
  }

  Guardar() {

    this.Procesando = true;
    const Datos = {

      Producto: this.Inventario.Producto,

      CodigoTipoProducto: this.Inventario.TipoProducto || 0,
      CodigoMarca: this.Inventario.Marca || 0,
      CodigoEstilo: this.Inventario.Diseño || 0,
      CodigoTalla: this.Inventario.Talla || 0,
      CodigoColor: this.Inventario.Color || 0,

      CodigoBarra: this.Inventario.CodigoBarra,
      Precio: this.Inventario.Precio,
      Stock: this.Inventario.Stock,

      Estatus: this.Inventario.EstatusSwitch ? 1 : 2,

      CodigoEmpresa: 1
    };

    // VALIDACIONES
    if (!Datos.CodigoTipoProducto) {
      this.AlertaServicio.MostrarAlerta('Debe seleccionar Tipo de Producto.');
      this.Procesando = false;
      return;
    }

    if (!Datos.Producto) {
      this.AlertaServicio.MostrarAlerta('El nombre del producto es obligatorio.');
      this.Procesando = false;
      return;
    }

    if (!Datos.CodigoTipoProducto) {
      this.AlertaServicio.MostrarAlerta('Debe seleccionar Tipo de Producto.');
      this.Procesando = false;
      return;
    }

    if (!Datos.CodigoMarca) {
      this.AlertaServicio.MostrarAlerta('Debe seleccionar Marca.');
      this.Procesando = false;
      return;
    }

    if (!Datos.CodigoEstilo) {
      this.AlertaServicio.MostrarAlerta('Debe seleccionar Estilo.');
      this.Procesando = false;
      return;
    }

    // EDITAR
    if (this.Inventario.CodigoInventario) {

      this.InventarioServicio
        .ActualizarProductoInventario(
          this.Inventario.CodigoInventario,
          Datos
        )
        .subscribe({

          next: () => {

            this.Procesando = false;

            this.AlertaServicio.MostrarExito(
              'Producto actualizado correctamente.'
            );

            this.Router.navigate(['/inventario-listado']);
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
    else {

      this.InventarioServicio
        .CrearProductoInventario(Datos)
        .subscribe({

          next: () => {

            this.Procesando = false;

            this.AlertaServicio.MostrarExito(
              'Producto creado correctamente.'
            );

            this.Router.navigate(['/inventario-listado']);
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
  AgregarNuevo(tipo: string) {

    this.PanelCatalogoActivo = tipo;

    this.NombreNuevoCatalogo = '';

    this.MostrarListas = {};

    this.CargarCatalogoPanel(tipo);

  }

  IconoCatalogo(tipo: string) {

    const iconos: any = {
      Marca: 'bi-tag-fill',
      Estilo: 'bi-palette-fill',
      Talla: 'bi-arrows-angle-expand',
      Color: 'bi-circle-fill'
    };

    return iconos[tipo] || 'bi-box';

  }

  NombreCatalogo(item: any) {

    if (this.PanelCatalogoActivo === 'Marca')
      return item.NombreMarca;

    if (this.PanelCatalogoActivo === 'Estilo')
      return item.NombreEstilo;

    if (this.PanelCatalogoActivo === 'Talla')
      return item.NombreTalla;

    if (this.PanelCatalogoActivo === 'Color')
      return item.NombreColor;

    return '';

  }
  CargarCatalogoPanel(tipo: string) {

    this.Procesando = true;

    let servicio;

    switch (tipo) {

      case 'Marca':
        servicio = this.InventarioServicio.ListadoMarca();
        break;

      case 'Estilo':
        servicio = this.InventarioServicio.ListadoEstilo();
        break;

      case 'Talla':
        servicio = this.InventarioServicio.ListadoTalla();
        break;

      case 'Color':
        servicio = this.InventarioServicio.ListadoColor();
        break;

      default:
        this.Procesando = false;
        return;
    }

    servicio.subscribe({

      next: (res: any) => {

        this.ListaCatalogoPanel = res.data || [];

        this.Procesando = false;

      },

      error: () => {

        this.ListaCatalogoPanel = [];

        this.Procesando = false;

      }

    });

  }

  ValidarTexto(event: KeyboardEvent) {

    const input = event.target as HTMLInputElement;

    const tecla = event.key;

    // ================= TECLAS CONTROL =================
    if (
      tecla === 'Backspace' ||
      tecla === 'Delete' ||
      tecla === 'ArrowLeft' ||
      tecla === 'ArrowRight' ||
      tecla === 'Tab'
    ) {
      return;
    }

    // ================= NO ESPACIO AL INICIO =================
    if (
      tecla === ' ' &&
      input.value.length === 0
    ) {
      event.preventDefault();
      return;
    }

    // ================= NO DOBLE ESPACIO =================
    if (
      tecla === ' ' &&
      input.value.endsWith(' ')
    ) {
      event.preventDefault();
      return;
    }

    // ================= SOLO LETRAS Y NUMEROS =================
    // ❌ SIN TILDES
    // ❌ SIN ESPECIALES
    const regex = /^[a-zA-Z0-9ñÑ ]$/;

    if (!regex.test(tecla)) {

      event.preventDefault();
    }
  }

  FormatearTexto(valor: string) {

    const normalizado = valor
      // quitar especiales
      .replace(/[^a-zA-Z0-9ñÑ ]/g, '')

      // evitar múltiples espacios
      .replace(/\s+/g, ' ')

      // evitar espacio inicial
      .trimStart()

      // formato capitalizado
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());

    this.NombreNuevoCatalogo = normalizado;
  }
  RecargarCatalogoPrincipal() {

    this.CargarCatalogo('Marcas', this.InventarioServicio.ListadoMarca());
    this.CargarCatalogo('Estilos', this.InventarioServicio.ListadoEstilo());
    this.CargarCatalogo('Tallas', this.InventarioServicio.ListadoTalla());
    this.CargarCatalogo('Colores', this.InventarioServicio.ListadoColor());

  }
  EditarCatalogo(item: any) {

    this.Procesando = true;
    this.ModoEdicion = true;

    let servicio;

    switch (this.PanelCatalogoActivo) {

      case 'Marca':
        this.CodigoCatalogoEditando = item.CodigoMarca;
        servicio = this.InventarioServicio.ObtenerMarcaPorCodigo(item.CodigoMarca);
        break;

      case 'Estilo':
        this.CodigoCatalogoEditando = item.CodigoEstilo;
        servicio = this.InventarioServicio.ObtenerEstiloPorCodigo(item.CodigoEstilo);
        break;

      case 'Talla':
        this.CodigoCatalogoEditando = item.CodigoTalla;
        servicio = this.InventarioServicio.ObtenerTallaPorCodigo(item.CodigoTalla);
        break;

      case 'Color':
        this.CodigoCatalogoEditando = item.CodigoColor;
        servicio = this.InventarioServicio.ObtenerColorPorCodigo(item.CodigoColor);
        break;

      default:
        this.Procesando = false;
        return;

    }

    servicio.subscribe({

      next: (res: any) => {

        const data = res.data;

        if (this.PanelCatalogoActivo === 'Marca')
          this.NombreNuevoCatalogo = data.NombreMarca;

        if (this.PanelCatalogoActivo === 'Estilo')
          this.NombreNuevoCatalogo = data.NombreEstilo;

        if (this.PanelCatalogoActivo === 'Talla')
          this.NombreNuevoCatalogo = data.NombreTalla;

        if (this.PanelCatalogoActivo === 'Color')
          this.NombreNuevoCatalogo = data.NombreColor;

        this.Procesando = false;

      },

      error: (err) => {

        this.Procesando = false;

        this.AlertaServicio.MostrarError(
          err,
          'Error al obtener registro'
        );

      }

    });

  }
  GuardarCatalogo() {

    if (!this.NombreNuevoCatalogo.trim()) {
      this.AlertaServicio.MostrarAlerta('Debe ingresar un nombre');
      return;
    }

    if (this.ModoEdicion) {
      this.ActualizarCatalogo();
    } else {
      this.AgregarCatalogo();
    }

  }
  AgregarCatalogo() {

    this.NombreNuevoCatalogo =
      this.NombreNuevoCatalogo
        .replace(/\s+/g, ' ')
        .trim();

    if (!this.NombreNuevoCatalogo.trim()) {
      this.AlertaServicio.MostrarAlerta('Debe ingresar un nombre');
      return;
    }

    this.Procesando = true;

    let servicio;

    switch (this.PanelCatalogoActivo) {

      case 'Marca':
        servicio = this.InventarioServicio.CrearMarca({
          NombreMarca: this.NombreNuevoCatalogo
        });
        break;

      case 'Estilo':
        servicio = this.InventarioServicio.CrearEstilo({
          NombreEstilo: this.NombreNuevoCatalogo
        });
        break;

      case 'Talla':
        servicio = this.InventarioServicio.CrearTalla({
          NombreTalla: this.NombreNuevoCatalogo
        });
        break;

      case 'Color':
        servicio = this.InventarioServicio.CrearColor({
          NombreColor: this.NombreNuevoCatalogo
        });
        break;

      default:
        this.Procesando = false;
        return;
    }

    servicio.subscribe({

      next: () => {

        this.AlertaServicio.MostrarExito(
          `${this.PanelCatalogoActivo} agregado correctamente`
        );

        this.NombreNuevoCatalogo = '';

        this.CargarCatalogoPanel(this.PanelCatalogoActivo!);

        this.RecargarCatalogoPrincipal();

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
  ActualizarCatalogo() {
    // ================= NORMALIZAR =================
    this.NombreNuevoCatalogo =
      this.NombreNuevoCatalogo
        .replace(/\s+/g, ' ')
        .trim();

    if (!this.NombreNuevoCatalogo) {
      this.AlertaServicio.MostrarAlerta('Debe ingresar un nombre');
      return;
    }
    this.Procesando = true;

    let servicio;

    switch (this.PanelCatalogoActivo) {

      case 'Marca':
        servicio = this.InventarioServicio.ActualizarMarca({
          CodigoMarca: this.CodigoCatalogoEditando,
          NombreMarca: this.NombreNuevoCatalogo
        });
        break;

      case 'Estilo':
        servicio = this.InventarioServicio.ActualizarEstilo({
          CodigoEstilo: this.CodigoCatalogoEditando,
          NombreEstilo: this.NombreNuevoCatalogo
        });
        break;

      case 'Talla':
        servicio = this.InventarioServicio.ActualizarTalla({
          CodigoTalla: this.CodigoCatalogoEditando,
          NombreTalla: this.NombreNuevoCatalogo
        });
        break;

      case 'Color':
        servicio = this.InventarioServicio.ActualizarColor({
          CodigoColor: this.CodigoCatalogoEditando,
          NombreColor: this.NombreNuevoCatalogo
        });
        break;

      default:
        this.Procesando = false;
        return;
    }

    servicio.subscribe({

      next: () => {

        this.AlertaServicio.MostrarExito(
          `${this.PanelCatalogoActivo} actualizado correctamente`
        );

        this.ModoEdicion = false;
        this.CodigoCatalogoEditando = null;
        this.NombreNuevoCatalogo = '';

        this.CargarCatalogoPanel(this.PanelCatalogoActivo!);
        this.RecargarCatalogoPrincipal();

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

  NormalizarTextoInput(event: any) {
    let valor = event.target.value;

    valor = valor
      .trimStart()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z\s]/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l: string) => l.toUpperCase());

    this.Inventario.Producto = valor;
    event.target.value = valor;
  }
  NormalizarPrecioInput(event: any) {
    let valor = event.target.value;

    // Reemplazar coma por punto
    valor = valor.replace(',', '.');

    // Solo números y punto
    valor = valor.replace(/[^0-9.]/g, '');

    // Evitar múltiples puntos
    const partes = valor.split('.');
    if (partes.length > 2) {
      valor = partes[0] + '.' + partes[1];
    }

    // Eliminar ceros a la izquierda (pero respetar "0." y casos vacíos)
    if (valor.startsWith('0') && !valor.startsWith('0.') && valor.length > 1) {
      valor = valor.replace(/^0+/, '');
    }

    // Limitar a 2 decimales (sin romper "10.")
    if (valor.includes('.')) {
      const [entero, decimal] = valor.split('.');
      valor = entero + '.' + (decimal ?? '').slice(0, 2);
    }

    // Permitir vacío mientras escribe (mejor UX)
    this.Inventario.Precio = valor;
    event.target.value = valor;
  }

  NormalizarStockInput(event: any) {
    let valor = event.target.value;

    // Solo números
    valor = valor.replace(/[^0-9]/g, '');

    // Eliminar ceros a la izquierda (pero permitir "0")
    if (valor.length > 1) {
      valor = valor.replace(/^0+/, '');
    }

    this.Inventario.Stock = valor;
    event.target.value = valor;
  }

}
