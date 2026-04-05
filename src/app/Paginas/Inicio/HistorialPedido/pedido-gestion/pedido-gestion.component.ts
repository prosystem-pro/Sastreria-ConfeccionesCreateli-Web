import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HistorialPedidoServicio } from '../../../../Servicios/HistorialPedidoServicio';
import { GestionClienteComponent } from '../../Clientes/gestion-cliente/gestion-cliente.component';
import { BorradorPedidoService } from '../../../../Servicios/Borradores/borrador-pedido.service';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';

type OpcionSelect = {
  value: string;
  label: string;
  tipo?: string;
};

@Component({
  selector: 'app-pedido-gestion',
  imports: [CommonModule, FormsModule, GestionClienteComponent, SpinnerGlobalComponent],
  templateUrl: './pedido-gestion.component.html',
  styleUrls: ['./pedido-gestion.component.css']
})
export class PedidoGestionComponent {
  // Dice si la forma de pago seleccionada es tarjeta
  EsTarjetaSeleccionada: boolean = false;
  PagoPendienteEliminar: any = null;
  ModalEliminarPagoVisible = false;
  MostrarModalPago = false;
  PagoDeslizado: any = null;
  Procesando = false;
  TotalAbonadoPagos: number = 0;
  Modo: 'CREAR' | 'EDITAR' = 'CREAR';

  FormaPagoSeleccionada: number | null = null;
  MontoPago: number | null = null;
  ReferenciaPago: string = '';

  TituloMedidas: any = {
    TipoCuello: { label: 'TP - Tipo de cuello', tipo: 'select' },
    Largo: { label: 'L - Largo', tipo: 'number' },
    Espalda: { label: 'E - Espalda', tipo: 'number' },
    LargoManga: { label: 'LM - Largo de Manga', tipo: 'number' },
    AnchoBrazo: { label: 'AB - Ancho de brazo', tipo: 'number' },
    Pecho: { label: 'P - Pecho', tipo: 'number' },
    Cintura: { label: 'C - Cintura', tipo: 'number' },
    CinturaT: { label: 'CT - Cintura Terminada', tipo: 'number' },
    Cuello: { label: 'C - Cuello', tipo: 'number' },

    Solapa: { label: 'S - Solapa', tipo: 'select' },
    TipoCorte: { label: 'TC - Tipo Corte', tipo: 'select' },
    Botones: { label: 'B- Botones', tipo: 'select' },
    Abertura: { label: 'A - Abertura', tipo: 'select' },

    Talle: { label: 'T - Talle', tipo: 'number' },
    EspaldaBaja: { label: 'EB - Espalda baja', tipo: 'number' },
    FrentePecho: { label: 'FP - Frente de pecho', tipo: 'number' },

    Diseno: { label: 'D - Diseño', tipo: 'select' },
    Categoria: { label: 'C - Categoría', tipo: 'select' },

    Cadera: { label: 'CA - Cadera', tipo: 'number' },
    Rodilla: { label: 'R - Rodilla', tipo: 'number' },
    Ruedo: { label: 'RD - Ruedo', tipo: 'number' },
    Tiro: { label: 'T - Tiro', tipo: 'number' },
    EntrePierna: { label: 'EP - Entrepiernas', tipo: 'number' },

    Tamano: { label: 'T - Tamaño', tipo: 'select' },
    Descripcion: { label: 'Detalle personalizado', tipo: 'textarea' }
  };
  MedidasPorProducto: { [key: string]: string[] } = {
    Camisa: ['TipoCuello', 'Largo', 'Espalda', 'LargoManga', 'AnchoBrazo', 'Pecho', 'Cintura', 'CinturaT', 'Cuello', 'Descripcion'],
    Saco: ['Solapa', 'TipoCorte', 'Botones', 'Abertura', 'Talle', 'Largo', 'Espalda', 'EspaldaBaja', 'LargoManga', 'AnchoBrazo', 'Pecho', 'Cintura', 'CinturaT', 'FrentePecho', 'Descripcion'],
    Pantalon: ['Diseno', 'Categoria', 'Largo', 'Cintura', 'Cadera', 'Rodilla', 'Ruedo', 'Tiro', 'EntrePierna', 'Descripcion'],
    Chaleco: ['Diseno', 'Botones', 'Talle', 'Espalda', 'Pecho', 'Cintura', 'Descripcion'],
    Corbata: ['Tamano', 'Descripcion'],
    Corbatin: ['Tamano', 'Descripcion']
  };

  // Controlar si se muestra modal de confirmación
  MostrarModalConfirmacion: boolean = false;
  // ------------------- ARRASTRE PRODUCTO -------------------

  ArrastrandoProducto = false;
  InicioXProducto = 0;
  UmbralEliminarProducto = 80;
  ProductoArrastrado: any = null;
  ElementoFilaProducto: HTMLElement | null = null;

  // ------------------- MODAL -------------------

  MensajeEliminarVisible = false;
  MensajeEliminarTexto = '';
  // ==============================
  // UI / ESTADO
  // ==============================
  MostrarMedidas = false;
  ProductoMedidas: any = null;
  MostrarModalCliente = false;
  MostrarPedido = true;
  MostrarProductos = false;
  MostrarPagos = false;
  MostrarListas: { [key: string]: boolean } = {};
  Codigo: number | null = null;

  // ==============================
  // CATÁLOGOS
  // ==============================

  TiposProducto: any[] = [];
  TiposTela: any[] = [];
  Telas: any[] = [];
  EstadoPedido: any[] = [];
  Productos: any[] = [];
  Clientes: any[] = [];
  TipoCuello: any[] = [];
  FormaPago: any[] = [];
  ListaPagos: any[] = [];

  // ==============================
  // FILTROS DE BÚSQUEDA
  // ==============================

  Filtros: any = {
    Cliente: '',
    Producto: '',
    TipoProducto: '',
    TipoTela: '',
    NombreTela: ''
  };

  // ==============================
  // DATOS TEMPORALES PRODUCTO
  // ==============================

  ProductoSeleccionado: any = null;
  PrecioSeleccionado: number = 0;

  ProductoTemp = {

    CodigoProducto: null,
    NombreProducto: '',

    CodigoTipoProducto: null,
    NombreTipoProducto: '',

    CodigoTipoTela: null,
    NombreTipoTela: '',

    CodigoTela: null,
    NombreTela: '',

    Codigo: '',
    Color: '',
    Cantidad: 0,
    Precio: 0,
    Referencia: ''
  };

  // ==============================
  // ESTRUCTURA PEDIDO
  // ==============================

  Pedido: any = {
    CodigoCliente: null,
    NombreCliente: '',
    FechaEntrega: '',
    CodigoEstadoPedido: null,
    Descuento: 0,
    Subtotal: 0,
    Total: 0,
    Productos: []
  };
  // ==============================
  // CONSTRUCTOR
  // ==============================

  constructor(
    private Router: Router,
    private Route: ActivatedRoute,
    private HistorialPedidoServicio: HistorialPedidoServicio,
    private BorradorPedidoService: BorradorPedidoService,
    private AlertaServicio: AlertaServicio
  ) { }

  GuardarBorrador() {
    if (this.Modo === 'CREAR') {
      this.BorradorPedidoService.GuardarPedido(this.Pedido);
    }
  }

  NormalizarTexto(texto: string): string {
    return (texto || '')
      .toLowerCase()
      .normalize('NFD') // separa tildes
      .replace(/[\u0300-\u036f]/g, ''); // elimina tildes
  }
  ObtenerCamposMedidas(producto: any): string[] {

    if (!producto?.NombreProducto) return [];

    const nombre = this.NormalizarTexto(producto.NombreProducto);

    if (nombre.includes('camisa')) return this.MedidasPorProducto['Camisa'];

    if (nombre.includes('saco')) return this.MedidasPorProducto['Saco'];

    if (nombre.includes('pantalon')) return this.MedidasPorProducto['Pantalon'];

    if (nombre.includes('chaleco')) return this.MedidasPorProducto['Chaleco'];

    if (nombre.includes('corbata')) return this.MedidasPorProducto['Corbata'];

    if (nombre.includes('corbatin')) return this.MedidasPorProducto['Corbatin'];

    return [];
  }
  ObtenerPlaceholder(campo: string): string {
    const label = this.TituloMedidas[campo]?.label || '';
    return 'Ingrese ' + label.split('-').pop()?.trim();
  }
  OpcionesSelect: { [key: string]: OpcionSelect[] } = {

    TipoCuello: [
      { value: 'AMERICANO', label: 'AMERICANO' },
      { value: 'ITALIANO', label: 'ITALIANO' },
      { value: 'MAO', label: 'MAO' },
      { value: 'OPERA', label: 'OPERA' }
    ],

    Solapa: [
      { value: 'MUESCA', label: 'MUESCA' },
      { value: 'PICO', label: 'PICO' },
      { value: 'CHAL', label: 'CHAL' },
      { value: 'MAO', label: 'MAO' }
    ],

    TipoCorte: [
      { value: 'REGULAR', label: 'REGULAR' },
      { value: 'SLIMFIT', label: 'SLIMFIT' },
      { value: 'SMART', label: 'SMART' }
    ],

    Botones: [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
      { value: '5', label: '5' },
      { value: '6', label: '6' }
    ],

    Abertura: [
      { value: 'SIN ABERTURA', label: 'SIN ABERTURA' },
      { value: 'UNA ABERTURA', label: 'UNA ABERTURA' },
      { value: 'DOS ABERTURA', label: 'DOS ABERTURA' }
    ],

    Diseno: [
      { value: 'SIN PALETONES', label: 'SIN PALETONES' },
      { value: '1 PALETON', label: '1 PALETON' },
      { value: '2 PALETONES', label: '2 PALETONES' },
      { value: '3 PALETONES', label: '3 PALETONES' },
      { value: 'DOCKER', label: 'DOCKER' }
    ],

    Categoria: [
      { value: 'TRAJE', label: 'TRAJE' },
      { value: 'PARTICULAR', label: 'PARTICULAR' }
    ],

    Tamano: [
      // CORBATÍN
      { value: 'INFANTIL', label: 'INFANTIL', tipo: 'CORBATIN' },
      { value: 'PEQUEÑO', label: 'PEQUEÑO', tipo: 'CORBATIN' },
      { value: 'MEDIANO', label: 'MEDIANO', tipo: 'CORBATIN' },
      { value: 'GRANDE', label: 'GRANDE', tipo: 'CORBATIN' },
      // CORBATA
      { value: 'INFANTIL', label: 'INFANTIL', tipo: 'CORBATA' },
      { value: 'ESTANDAR', label: 'ESTANDAR', tipo: 'CORBATA' }
    ]

  };
  CargarPagos() {

    if (!this.Pedido?.CodigoPedido)
      return;

    this.HistorialPedidoServicio
      .ListadoPagosPorPedido(this.Pedido.CodigoPedido)
      .subscribe({

        next: (resp: any) => {

          this.ListaPagos = resp?.data || [];
console.log('IRA2',this.ListaPagos )
          // suma directa aquí
          this.TotalAbonadoPagos = this.ListaPagos.reduce(
            (total: number, p: any) => total + Number(p.Monto || 0),
            0
          );


        },

        error: (err) => {

          console.error('Error al cargar pagos', err);

          this.ListaPagos = [];
          this.TotalAbonadoPagos = 0;

        }

      });

  }
  ObtenerOpcionesSelect(campo: string): OpcionSelect[] {

    const opciones = this.OpcionesSelect[campo] || [];

    if (campo === 'Tamano') {

      const nombre = this.NormalizarTexto(this.ProductoMedidas?.NombreProducto || '');

      if (nombre.includes('corbatin')) {
        return opciones.filter((o: OpcionSelect) => o.tipo === 'CORBATIN');
      }

      if (nombre.includes('corbata')) {
        return opciones.filter((o: OpcionSelect) => o.tipo === 'CORBATA');
      }

      return opciones;
    }

    return opciones;
  }
  ObtenerCamposPorTipo(tipo: string): string[] {
    const campos = this.ObtenerCamposMedidas(this.ProductoMedidas);

    return campos.filter(c => this.TituloMedidas[c]?.tipo === tipo);
  }

  ObtenerCamposNoDescripcion(): string[] {
    const campos = this.ObtenerCamposMedidas(this.ProductoMedidas);

    return campos.filter(c =>
      this.TituloMedidas[c]?.tipo !== 'textarea' &&
      this.TituloMedidas[c]?.tipo !== 'select'
    );
  }

  ObtenerDescripcion(): string[] {
    const campos = this.ObtenerCamposMedidas(this.ProductoMedidas);

    return campos.filter(c => this.TituloMedidas[c]?.tipo === 'textarea');
  }
  IniciarArrastreProducto(event: any, prod: any) {

    this.ArrastrandoProducto = true;
    this.ProductoArrastrado = prod;

    this.InicioXProducto = event.touches?.[0].clientX || event.clientX;

    this.ElementoFilaProducto =
      (event.currentTarget as HTMLElement).querySelector('.fila-contenido');
  }
  DuranteArrastreProducto(event: any) {

    if (!this.ArrastrandoProducto || !this.ElementoFilaProducto) return;

    const xActual = event.touches?.[0].clientX || event.clientX;

    const desplazamiento = Math.max(0, xActual - this.InicioXProducto);

    this.ElementoFilaProducto.style.transform = `translateX(${desplazamiento}px)`;
  }

  FinalizarArrastreProducto() {

    if (!this.ArrastrandoProducto || !this.ElementoFilaProducto) return;

    const desplazamiento =
      parseInt(this.ElementoFilaProducto.style.transform.replace('translateX(', '')) || 0;

    if (desplazamiento > this.UmbralEliminarProducto) {

      // 🔹 Usamos la confirmación de Bootstrap/Swal
      this.AlertaServicio.Confirmacion(
        'Eliminar producto',
        '¿Desea eliminar este producto?',
        'Sí, eliminar',
        'Cancelar'
      ).then(confirmed => {
        if (confirmed) {
          this.ConfirmarEliminarProducto();
        } else if (this.ElementoFilaProducto) {
          this.ElementoFilaProducto.style.transform = 'translateX(0)';
          this.LimpiarArrastreProducto();
        }
      });

    } else {
      this.ElementoFilaProducto.style.transform = 'translateX(0)';
      this.LimpiarArrastreProducto();
    }

    this.ArrastrandoProducto = false;
  }


  ConfirmarEliminarProducto() {

    if (!this.ProductoArrastrado) return;
    this.Pedido.Productos =
      this.Pedido.Productos.filter((p: any) => p !== this.ProductoArrastrado);

    this.CalcularTotales();

    this.GuardarBorrador();

  }

  LimpiarArrastreProducto() {

    this.ElementoFilaProducto = null;
    this.ProductoArrastrado = null;
  }

  // ==============================
  // LIFECYCLE
  // ==============================

  ngOnInit() {

    if (this.Modo === 'CREAR') {
      this.BorradorPedidoService.LimpiarPedido();
    }

    const borrador = this.BorradorPedidoService.ObtenerPedido();

    if (borrador) {
      this.Pedido = borrador;
      this.Filtros['Cliente'] = this.Pedido.NombreCliente;
    }

    const codigo = this.Route.snapshot.paramMap.get('codigo');

    if (codigo) {
      this.Modo = 'EDITAR';
      this.Codigo = Number(codigo);
      this.CargarPedido();
    }

    this.CargarCatalogos();
  }
  // ==============================
  // CARGA DE CATÁLOGOS
  // ==============================

  CargarCatalogos() {

    this.HistorialPedidoServicio.ListadoTipoProducto()
      .subscribe((res: any) => this.TiposProducto = res.data);

    this.HistorialPedidoServicio.ListadoTipoTela()
      .subscribe((res: any) => this.TiposTela = res.data);

    this.HistorialPedidoServicio.ListadoTela()
      .subscribe((res: any) => this.Telas = res.data);

    this.HistorialPedidoServicio.ListadoEstadoPedido()
      .subscribe((res: any) => this.EstadoPedido = res.data);

    this.HistorialPedidoServicio.ListadoCliente()
      .subscribe((res: any) => this.Clientes = res.data);

    this.HistorialPedidoServicio.ListadoTipoCuello()
      .subscribe((res: any) => this.TipoCuello = res.data);

    this.HistorialPedidoServicio.ListadoFormaPago()
      .subscribe((res: any) => this.FormaPago = res.data);
  }

  // ==============================
  // MODAL CLIENTE
  // ==============================

  AbrirModalCliente() {
    this.MostrarModalCliente = true;
  }

  CerrarModalCliente() {
    this.MostrarModalCliente = false;
  }

  ClienteCreado(cliente: any) {

    const modal = document.getElementById('modalCliente');

    if (modal) {
      const modalBootstrap = (window as any).bootstrap.Modal.getInstance(modal);
      modalBootstrap.hide();
    }

    this.HistorialPedidoServicio.ListadoCliente()
      .subscribe((res: any) => {
        this.Clientes = res.data;
      });
  }

  // ==============================
  // BUSCADOR / FILTROS
  // ==============================

  Filtrados(key: string, lista: any[], campoNombre: string) {

    const filtro = (this.Filtros[key] || '').toLowerCase();

    if (!filtro) return lista;

    return lista.filter(item =>
      (item[campoNombre] ?? '').toLowerCase().includes(filtro)
    );
  }

  AlternarListaBusqueda(key: string, event: Event) {

    event.stopPropagation();

    const abierta = this.MostrarListas[key];

    if (!abierta) {
      this.Filtros[key] = '';
    }

    this.MostrarListas[key] = !abierta;
  }

  AplicarSeleccion(
    key: string,
    item: any,
    objetoDestino: any,
    campoCodigo: string,
    campoNombreOrigen: string,
    campoNombreDestino: string
  ) {

    objetoDestino[campoCodigo] = item[campoCodigo];
    objetoDestino[campoNombreDestino] = item[campoNombreOrigen];

    this.Filtros[key] = item[campoNombreOrigen];
    this.MostrarListas[key] = false;

    if (key === 'TipoProducto') {

      this.ProductoTemp.CodigoProducto = null;
      this.ProductoTemp.NombreProducto = '';
      this.Filtros['Producto'] = '';

      this.HistorialPedidoServicio
        .ListadoProducto(item.CodigoTipoProducto)
        .subscribe((res: any) => {
          this.Productos = res.data;
        });
    }

    this.GuardarBorrador();
  }


  AplicarSeleccionProducto(producto: any) {

    this.ProductoTemp.CodigoProducto = producto.CodigoProducto;
    this.ProductoTemp.NombreProducto = producto.NombreProducto;
    this.ProductoTemp.CodigoTipoProducto = producto.CodigoTipoProducto;

    this.Filtros['Producto'] = producto.NombreProducto;
    this.MostrarListas['Producto'] = false;

    this.HistorialPedidoServicio.ObtenerProducto(producto.CodigoProducto)
      .subscribe(res => {
        this.ProductoTemp.Precio = res.data?.Precio || 0;
      });
  }
  // ==============================
  // PRODUCTOS
  // ==============================
  AgregarProducto() {

    if (!this.ProductoTemp.CodigoProducto || !this.ProductoTemp.Cantidad || !this.ProductoTemp.Precio) {
      alert('Debe seleccionar un producto');
      return;
    }

    // 🔒 Forzar tipos correctos
    const cantidad = Number(this.ProductoTemp.Cantidad);
    const precio = Number(this.ProductoTemp.Precio);

    if (cantidad <= 0 || precio <= 0) {
      alert('Cantidad y precio deben ser mayores a 0');
      return;
    }

    const subtotal = cantidad * precio;

    // 🧼 Crear objeto LIMPIO (SIN SPREAD)
    const producto = {

      CodigoProducto: this.ProductoTemp.CodigoProducto,
      NombreProducto: this.ProductoTemp.NombreProducto,

      CodigoTipoProducto: this.ProductoTemp.CodigoTipoProducto,
      NombreTipoProducto: this.ProductoTemp.NombreTipoProducto,

      CodigoTipoTela: this.ProductoTemp.CodigoTipoTela,
      NombreTipoTela: this.ProductoTemp.NombreTipoTela,

      CodigoTela: this.ProductoTemp.CodigoTela,
      NombreTela: this.ProductoTemp.NombreTela,

      Codigo: this.ProductoTemp.Codigo,
      Color: this.ProductoTemp.Color,

      Cantidad: cantidad,
      Precio: precio,
      Subtotal: subtotal,

      Referencia: this.ProductoTemp.Referencia,

      Medidas: {
        TipoCuello: null,
        Largo: null,
        Espalda: null,
        LargoManga: null,
        AnchoBrazo: null,
        Pecho: null,
        Cintura: null,
        CinturaT: null,
        Cuello: null,
        Descripcion: '',

        Solapa: '',
        TipoCorte: '',
        Botones: '',
        Abertura: '',

        Talle: null,
        EspaldaBaja: null,
        FrentePecho: null,

        Diseno: '',
        Categoria: '',

        Cadera: null,
        Rodilla: null,
        Ruedo: null,
        Tiro: null,
        EntrePierna: null,

        Tamano: ''
      }
    };

    // 🔥 Evitar duplicados (opcional pero profesional)
    const index = this.Pedido.Productos.findIndex((p: any) =>
      p.CodigoProducto === producto.CodigoProducto &&
      p.Codigo === producto.Codigo &&
      p.Color === producto.Color
    );

    if (index !== -1) {
      // 👉 Si ya existe, SUMA cantidad
      this.Pedido.Productos[index].Cantidad += cantidad;
      this.Pedido.Productos[index].Subtotal =
        this.Pedido.Productos[index].Cantidad * this.Pedido.Productos[index].Precio;
    } else {
      this.Pedido.Productos.push(producto);
    }

    this.LimpiarProducto();
    this.CalcularTotales();
    this.GuardarBorrador();
  }

  AbrirMedidas(prod: any) {
    if (prod.NombreTipoProducto === 'FISICO') {

      this.AlertaServicio.MostrarAlerta('Este producto no requiere medidas');

      return;
    }

    // ✅ flujo normal
    this.ProductoMedidas = prod;
    this.MostrarProductos = false;
    this.MostrarMedidas = true;
  }
  VolverProductos() {

    this.MostrarMedidas = false;
    this.MostrarProductos = true;

    this.GuardarBorrador();
  }
  LimpiarProducto() {

    this.ProductoTemp = {

      CodigoProducto: null,
      NombreProducto: '',

      CodigoTipoProducto: null,
      NombreTipoProducto: '',

      CodigoTipoTela: null,
      NombreTipoTela: '',

      CodigoTela: null,
      NombreTela: '',

      Codigo: '',
      Color: '',

      Cantidad: 0,
      Precio: 0,
      Referencia: ''
    };

    this.Filtros['Producto'] = '';
    this.Filtros['TipoProducto'] = '';
    this.Filtros['TipoTela'] = '';
    this.Filtros['NombreTela'] = '';
  }

  // ==============================
  // CÁLCULOS
  // ==============================

  CalcularTotales() {

    const subtotal = this.Pedido.Productos
      .reduce((acc: number, prod: any) => acc + prod.Subtotal, 0);

    const porcentaje = this.Pedido.Descuento || 0;

    const descuentoMonto = subtotal * (porcentaje / 100);

    const total = subtotal - descuentoMonto;

    this.Pedido.Subtotal = subtotal;
    this.Pedido.Total = total;

    this.GuardarBorrador();
  }
  // ==============================
  // PEDIDO
  // ==============================
  CargarPedido() {
    this.Procesando = true;
    if (!this.Codigo) return;

    this.HistorialPedidoServicio.ObtenerPedido(this.Codigo)
      .subscribe((res: any) => {

        const data = res.data;

        this.Pedido = {
          CodigoPedido: data.CodigoPedido,
          CodigoCliente: data.CodigoCliente || null,
          NombreCliente: data.NombreCliente || '',
          FechaEntrega: data.FechaEntrega ? data.FechaEntrega.split('T')[0] : '',
          CodigoEstadoPedido: data.CodigoEstadoPedido ?? null,
          Descuento: data.Descuento || 0,
          Subtotal: data.Subtotal || 0,
          Total: data.Total || 0,
          TotalAbonado: data.TotalAbonado || 0,
          SaldoPendiente: data.SaldoPendiente || 0,

          Productos: data.Productos?.map((p: any) => {

            const medidas = p.Medidas || {};

            return {
              ...p,
              Subtotal: p.Cantidad * p.Precio,

              Medidas: {
                TipoCuello: p.TipoCuello ?? null,

                Largo: medidas.Largo ?? null,
                Espalda: medidas.Espalda ?? null,
                LargoManga: medidas.LargoManga ?? null,
                AnchoBrazo: medidas.AnchoBrazo ?? null,
                Pecho: medidas.Pecho ?? null,
                Cintura: medidas.Cintura ?? null,
                CinturaT: medidas.CinturaT ?? null,
                Cuello: medidas.Cuello ?? null,
                Descripcion: medidas.Descripcion ?? '',

                Solapa: medidas.Solapa ?? null,
                TipoCorte: medidas.TipoCorte ?? null,
                Botones: medidas.Botones ?? null,
                Abertura: medidas.Abertura ?? null,
                Talle: medidas.Talle ?? null,
                EspaldaBaja: medidas.EspaldaBaja ?? null,
                FrentePecho: medidas.FrentePecho ?? null,

                Diseno: medidas.Diseno ?? null,
                Categoria: medidas.Categoria ?? null,
                Cadera: medidas.Cadera ?? null,
                Rodilla: medidas.Rodilla ?? null,
                Ruedo: medidas.Ruedo ?? null,
                Tiro: medidas.Tiro ?? null,
                EntrePierna: medidas.EntrePierna ?? null,

                Tamano: medidas.Tamano ?? null
              }
            };
          }) || []
        };

        this.Filtros['Cliente'] = this.Pedido.NombreCliente;

        this.CalcularTotales();
        this.Procesando = false;
      });
  }

  // ==============================
  // UI
  // ==============================
  GuardarPago() {

    if (!this.FormaPagoSeleccionada) {
      this.AlertaServicio.MostrarAlerta('Debe seleccionar una forma de pago');
      return;
    }

    if (!this.MontoPago || this.MontoPago <= 0) {
      this.AlertaServicio.MostrarAlerta('Debe ingresar un monto válido');
      return;
    }

    if (!this.Pedido?.CodigoPedido) {
      this.AlertaServicio.MostrarAlerta('No existe pedido para registrar el pago');
      return;
    }

    const payload = {
      CodigoPedido: this.Pedido.CodigoPedido,
      FormaPago: this.FormaPagoSeleccionada,
      MontoPago: this.MontoPago
    };

    this.Procesando = true;

    this.HistorialPedidoServicio
      .RegistrarPagoPedido(payload)
      .subscribe({

        next: (resp: any) => {

          const nuevoPago = resp?.data;

          if (nuevoPago) {

            if (!this.Pedido.Pagos) {
              this.Pedido.Pagos = [];
            }

            this.Pedido.Pagos.push(nuevoPago);

            this.Pedido.TotalAbonado =
              (this.Pedido.TotalAbonado || 0) + this.MontoPago;

            this.Pedido.SaldoPendiente =
              this.Pedido.Total - this.Pedido.TotalAbonado;
          }

          this.FormaPagoSeleccionada = null;
          this.MontoPago = null;

          this.AlertaServicio.MostrarExito('Pago registrado correctamente');

          this.CargarPagos();
          this.Procesando = false;
        },

        error: (err) => {

          console.error('Error al registrar pago', err);

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
  DescargarPDFPago(CodigoPago: number) {

    this.Procesando = true;
    console.log('IRA',CodigoPago)
    this.HistorialPedidoServicio

      .DescargarPDFPagoPedido(CodigoPago)
      .subscribe({
        next: (blob) => {

          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `pago_pedido_${CodigoPago}.pdf`;

          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          window.URL.revokeObjectURL(url);

          this.Procesando = false;
        },
        error: (err) => {

          
          console.error('Error al registrar pago', err);

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
  Guardar() {
    // ✅ Validaciones
    if (!this.Pedido.CodigoCliente) {
      alert('Debe seleccionar un cliente');
      return;
    }

    if (!this.Pedido.Productos || this.Pedido.Productos.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    this.CalcularTotales();

    if (this.Modo === 'CREAR') {
      // 🔹 Mostrar modal de confirmación solo al crear
      this.MostrarModalConfirmacion = true;
    } else {
      // 🔹 Directamente actualizar si estamos en modo EDITAR
      this.ConfirmarPedido();

    }
  }

  onFormaPagoChange() {
    const forma = this.FormaPago.find(fp => fp.CodigoFormaPago === this.FormaPagoSeleccionada);
    // Compara el nombre en mayúsculas para que no falle por "Tarjeta" vs "TARJETA"
    this.EsTarjetaSeleccionada = forma?.NombreFormaPago?.toUpperCase() === 'TARJETA';
  }

  ConfirmarPedido() {
    if (this.Procesando) return; // prevenir doble click
    this.Procesando = true;

    const payload: any = { ...this.Pedido };

    if (this.Modo === 'CREAR') {
      payload.FormaPago = this.FormaPagoSeleccionada || 1;
      payload.MontoPago = this.MontoPago || this.Pedido.Total;

      const formaSeleccionada = this.FormaPago.find(
        fp => fp.CodigoFormaPago === this.FormaPagoSeleccionada
      );
      if (formaSeleccionada?.NombreFormaPago === 'TARJETA') {
        payload.Referencia = this.ReferenciaPago;
      }
    } else {
      payload.CodigoPedido = this.Codigo;
    }

    const servicio = this.Modo === 'CREAR'
      ? this.HistorialPedidoServicio.CrearPedido(payload)
      : this.HistorialPedidoServicio.ActualizarPedido(payload);

    servicio.subscribe({
      next: (resp: any) => {
        if (this.Modo === 'CREAR') {
          this.BorradorPedidoService.LimpiarPedido();
          this.AlertaServicio.MostrarExito('Pedido creado correctamente');
        } else {
          this.AlertaServicio.MostrarExito('Pedido actualizado correctamente');
        }

        this.MostrarModalConfirmacion = false;
        this.Router.navigate(['/pedido-listado']);
      },
      error: (err) => {
        this.AlertaServicio.MostrarError(err, 'Ocurrió un error al procesar el pedido');
      }
    }).add(() => {
      // 🔹 Siempre se ejecuta al terminar, éxito o error
      this.Procesando = false;
    });
  }
  AbrirProductos() {
    this.MostrarPedido = false;
    this.MostrarProductos = true;
  }
  AbrirPagos() {
    if (!this.Pedido?.CodigoPedido) {
      alert('Debe guardar el pedido primero');
      return;
    }

    this.MostrarPedido = false;
    this.MostrarProductos = false;
    this.MostrarPagos = true;

    this.CargarPagos();
  }

  VolverPedido() {
    this.MostrarPedido = true;
    this.MostrarProductos = false;
    this.MostrarPagos = false;
  }

  // ==============================
  // NAVEGACIÓN
  // ==============================

  IrARuta(ruta: string) {
    this.Router.navigate([ruta]);
  }
  ArrastrePago(event: PointerEvent, pago: any, fila: any) {

    const inicioX = event.clientX;
    const elemento = fila as HTMLElement;

    elemento.style.transition = 'none';

    const mover = (e: PointerEvent) => {

      const desplazamiento = Math.max(0, e.clientX - inicioX);

      elemento.style.transform =
        `translateX(${desplazamiento}px)`;

      if (desplazamiento > 120) {

        document.removeEventListener('pointermove', mover);
        document.removeEventListener('pointerup', soltar);

        elemento.style.transform = 'translateX(0)';
        elemento.style.transition = '0.2s';

        // REEMPLAZA confirm
        this.PagoPendienteEliminar = pago;
        this.ModalEliminarPagoVisible = true;
      }
    };

    const soltar = () => {

      elemento.style.transition = '0.2s';
      elemento.style.transform = 'translateX(0)';

      document.removeEventListener('pointermove', mover);
      document.removeEventListener('pointerup', soltar);
    };

    document.addEventListener('pointermove', mover);
    document.addEventListener('pointerup', soltar);
  }
  EliminarPago(pago: any) {

    // this.Procesando = true;

    // this.api.EliminarPago(pago.CodigoPago)
    //     .subscribe({

    //         next: () => {

    //             this.ListaPagos =
    //                 this.ListaPagos.filter(
    //                     x => x.CodigoPago !== pago.CodigoPago
    //                 );

    //             this.CalcularTotalesPagos();

    //             this.Procesando = false;
    //         },

    //         error: () => {

    //             this.Procesando = false;
    //             alert("Error eliminando pago");
    //         }

    //     });
  }
}
