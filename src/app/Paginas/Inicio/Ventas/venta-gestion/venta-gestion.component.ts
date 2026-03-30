import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HistorialPedidoServicio } from '../../../../Servicios/HistorialPedidoServicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';
import { GestionClienteComponent } from '../../Clientes/gestion-cliente/gestion-cliente.component';
import { VentaServicio } from '../../../../Servicios/VentaServicio';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { CommonModule } from '@angular/common';
import { BarcodeFormat } from '@zxing/library';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-venta-gestion',
  imports: [SpinnerGlobalComponent, CommonModule, FormsModule, GestionClienteComponent, ZXingScannerModule],
  templateUrl: './venta-gestion.component.html',
  styleUrl: './venta-gestion.component.css'
})
export class VentaGestionComponent implements OnInit {
  MostrarQR = false;
  qrResult: string = '';

  formats = [BarcodeFormat.QR_CODE];
  DescuentoAplicado: number = 0;
  // Selecciones
  ClienteSeleccionado: any = null;
  ProductoSeleccionado: any = null;

  // Filtros y listas
  Filtros: any = {};
  MostrarListas: any = {};
  Listas: any = {};

  // Spinner y modal
  Procesando = false;
  ModalCliente = false;

  // Venta
  Venta: any = {
    Cliente: null,
    Descuento: 0,
    FormaPago: 'EFECTIVO',
    Pago: 0
  };

  Clientes: any[] = [];
  Productos: any[] = [];
  ProductosVenta: any[] = [];

  CantidadProducto = 0;

  // Totales
  Subtotal = 0;
  Total = 0;

  constructor(
    private router: Router,
    private HistorialPedidoServicio: HistorialPedidoServicio,
    private VentaServicio: VentaServicio,
    private Alerta: AlertaServicio
  ) { }

  ngOnInit() {

    this.CargarClientes();
    this.CargarProductos();
  }
  AbrirQR() {

    this.MostrarQR = true;

  }
  Escaneado(result: string) {

    this.qrResult = result;

    this.MostrarQR = false;

    this.BuscarProductoPorQR(result);

  }
  BuscarProductoPorQR(codigo: string) {

    const producto = this.Productos.find(
      x => x.CodigoInventario == codigo
    );

    if (!producto) {

      this.Alerta.MostrarError('Producto no encontrado');

      return;
    }

    this.ProductoSeleccionado = producto;

    this.Filtros['Producto'] = producto.NombreProducto;

  }
  // Navegación
  IrARuta(ruta: string) {
    this.router.navigate([ruta]);
  }

  // Carga de clientes
  CargarClientes() {
    this.Procesando = true;
    this.HistorialPedidoServicio.ListadoCliente().subscribe({
      next: (res: any) => this.Clientes = res.data || [],
      error: (err) => this.Alerta.MostrarError(err, 'Error al cargar clientes'),
      complete: () => this.Procesando = false
    });
  }

  // Carga de productos
  // Carga de productos
  CargarProductos() {
    this.Procesando = true;
    console.log('Iniciando carga de productos...');

    this.VentaServicio.ListadoProducto().subscribe({
      next: (res: any) => {
        console.log('Respuesta completa del servicio:', res);

        if (res && res.success) {
          this.Productos = Array.isArray(res.data) ? res.data : [];

          console.log('Productos cargados:', this.Productos);
        } else {
          console.warn('La API respondió sin éxito:', res?.message);
          this.Productos = [];
          this.Alerta.MostrarError(res?.message || 'No se pudieron cargar los productos');
        }
      },

      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.Productos = [];
        this.Alerta.MostrarError(err, 'Error al cargar productos');
      },

      complete: () => {
        this.Procesando = false;
        console.log('Carga de productos finalizada');
      }
    });
  }
  AplicarCliente() {

    if (!this.ClienteSeleccionado) {
      this.Alerta.MostrarError('Seleccione un cliente');
      return;
    }

    this.Venta.Cliente = this.ClienteSeleccionado;

    this.MostrarListas['Cliente'] = false;

  }
  LimpiarProducto() {

    this.ProductoSeleccionado = null;
    this.ClienteSeleccionado = null;
    this.CantidadProducto = 0;

    this.Filtros['Producto'] = '';
    this.Filtros['Cliente'] = '';

    this.MostrarListas['Producto'] = false;

  }
  AplicarDescuento() {

    this.DescuentoAplicado = this.Venta.Descuento || 0;

    this.CalcularTotales();

  }
  // Agregar producto a la venta
  AgregarProducto() {

    if (!this.ProductoSeleccionado) {
      this.Alerta.MostrarError('Seleccione un producto');
      return;
    }

    if (!this.CantidadProducto || this.CantidadProducto <= 0) {
      this.Alerta.MostrarError('Ingrese cantidad válida');
      return;
    }

    const producto = this.ProductoSeleccionado;

    const existe = this.ProductosVenta.find(
      x => x.CodigoInventario === producto.CodigoInventario
    );

    if (existe) {

      existe.Cantidad += this.CantidadProducto;
      existe.Total = existe.Cantidad * existe.PrecioVenta;

    } else {

      this.ProductosVenta.push({

        CodigoInventario: producto.CodigoInventario,
        Producto: producto.NombreProducto,
        PrecioVenta: producto.PrecioVenta,
        Cantidad: this.CantidadProducto,
        Total: producto.PrecioVenta * this.CantidadProducto

      });

    }

    this.LimpiarProducto();

    this.CalcularTotales();
  }
  // Filtrar lista de select
  Filtrados(tipo: string, lista: any[], campo: string) {

    if (!lista) return [];

    const filtro = (this.Filtros[tipo] || '').toLowerCase();

    return lista.filter(item =>
      item[campo]?.toLowerCase().includes(filtro)
    );
  }
  // Alternar listas de búsqueda
  AlternarListaBusqueda(tipo: string, event: Event) {

    event.stopPropagation();

    const estaAbierto = this.MostrarListas[tipo];

    // cerrar todos
    this.CerrarListas();

    // si estaba cerrado, lo abrimos
    if (!estaAbierto) {

      // limpiar filtro para mostrar toda la lista
      this.Filtros[tipo] = '';

      this.MostrarListas[tipo] = true;
    }
  }

  // Cerrar todas las listas
  CerrarListas() {

    this.MostrarListas = {
      Cliente: false,
      Producto: false
    };

  }
  // Seleccionar item del select
  Seleccionar(tipo: string, item: any) {

    if (tipo === 'Producto') {

      this.ProductoSeleccionado = item;
      this.Filtros[tipo] = item.NombreProducto;

    }
    else if (tipo === 'Cliente') {

      this.ClienteSeleccionado = item;
      this.Filtros[tipo] = item.NombreCliente;

    }

    this.MostrarListas[tipo] = false;
  }

  // Modal cliente
  AbrirModalCliente(event: Event) {
    event.stopPropagation();
    this.ModalCliente = true;
  }

  CerrarModalCliente() {
    this.ModalCliente = false;
  }

  ClienteCreado(cliente: any) {
    this.Clientes.push(cliente);
    this.Venta.Cliente = cliente;
    this.ClienteSeleccionado = cliente;
    this.Filtros['Cliente'] = cliente.NombreCliente;
    this.ModalCliente = false;
  }

  CalcularTotales() {

    this.Subtotal = this.ProductosVenta.reduce(
      (s, x) => s + x.Total,
      0
    );

    const porcentaje = this.DescuentoAplicado || 0;

    this.Total = this.Subtotal - (this.Subtotal * (porcentaje / 100));
  }
  // Guardar venta
  GuardarVenta() {
    if (!this.Venta.Cliente) return;
    if (this.ProductosVenta.length === 0) return;

    this.Procesando = true;

    const venta = {
      CodigoCliente: this.Venta.Cliente.CodigoCliente,
      Descuento: this.Venta.Descuento,
      FormaPago: this.Venta.FormaPago,
      Pago: this.Venta.Pago,
      Subtotal: this.Subtotal,
      Total: this.Total,
      Productos: this.ProductosVenta
    };

    console.log(venta);

    // Simulación de guardado
    setTimeout(() => {
      this.Procesando = false;
      this.router.navigate(['/ventas-listado']);
    }, 800);
  }

}
