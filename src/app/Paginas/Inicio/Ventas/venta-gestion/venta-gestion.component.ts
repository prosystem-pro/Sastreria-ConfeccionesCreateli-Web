import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HistorialPedidoServicio } from '../../../../Servicios/HistorialPedidoServicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';
import { GestionClienteComponent } from '../../Clientes/gestion-cliente/gestion-cliente.component';
import { VentaServicio } from '../../../../Servicios/VentaServicio';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// @ts-ignore
import Quagga from 'quagga';


@Component({
  selector: 'app-venta-gestion',
  imports: [SpinnerGlobalComponent, CommonModule, FormsModule, GestionClienteComponent],
  templateUrl: './venta-gestion.component.html',
  styleUrl: './venta-gestion.component.css'
})
export class VentaGestionComponent implements OnInit {
  escaneoProcesado = false;
  ScannerActivo = false;
  FormasPago: any[] = [];
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
    FormaPago: null,
    Pago: 0,
    Referencia: null
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
    this.CargarFormasPago();
  }
  LimpiarCerosCodigo(codigo: string): string {

    if (!codigo) return '';

    // elimina ceros al inicio
    return codigo.replace(/^0+/, '');

  }
  // Función para abrir la cámara y escanear
  AbrirScanner() {

    this.ScannerActivo = true;
    this.escaneoProcesado = false;

    setTimeout(() => {

      const target = document.querySelector('#scanner-container');

      if (!target) {
        console.error("No se encontró el contenedor del scanner.");
        return;
      }

      Quagga.init({
        inputStream: {
          type: "LiveStream",
          target: target,
          constraints: {
            facingMode: "environment"
          },
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader"
          ]
        }

      }, (err: any) => {

        if (err) {
          console.error("Error inicializando Quagga:", err);
          return;
        }

        Quagga.start();
      });

      Quagga.onDetected((result: any) => {

        if (this.escaneoProcesado) return;

        if (result?.codeResult?.code) {

          this.escaneoProcesado = true;

          let codigo = result.codeResult.code;

          console.log("Código detectado:", codigo);

          // limpiar ceros al inicio
          codigo = this.LimpiarCerosCodigo(codigo);

          console.log("Código limpio:", codigo);

          // llenar input con código limpio
          this.Filtros['Producto'] = codigo;

          // buscar producto automáticamente
          const productoEncontrado = this.Productos.find(p =>
            this.LimpiarCerosCodigo(p.CodigoBarras) === codigo
          );

          if (productoEncontrado) {

            this.ProductoSeleccionado = productoEncontrado;
            this.Filtros['Producto'] = productoEncontrado.NombreProducto;
            this.CantidadProducto = 1;
            this.MostrarListas['Producto'] = false;

          } else {

            this.Alerta.MostrarError('Producto no encontrado');

          }

          this.CerrarScanner();
        }

      });

    }, 100);
  }
  // Función para cerrar la cámara y limpiar listeners
  CerrarScanner() {

    this.ScannerActivo = false;
    this.escaneoProcesado = false;

    try {
      Quagga.stop();
      Quagga.offDetected();
    } catch (e) {
      console.warn("Quagga ya estaba detenido");
    }

  }
  IrARuta(ruta: string) {
    this.router.navigate([ruta]);
  }
  CargarFormasPago() {

    this.Procesando = true;

    this.HistorialPedidoServicio.ListadoFormaPago().subscribe({

      next: (res: any) => {

        if (res && res.success) {

          this.FormasPago = res.data || [];

        } else {

          this.FormasPago = [];
          this.Alerta.MostrarError(
            res?.message || 'No se pudieron cargar las formas de pago'
          );

        }

      },

      error: (err) => {

        this.FormasPago = [];
        this.Alerta.MostrarError(
          err,
          'Error al cargar formas de pago'
        );

      },

      complete: () => this.Procesando = false

    });

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
  CargarProductos() {
    this.Procesando = true;

    this.VentaServicio.ListadoProducto().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.Productos = Array.isArray(res.data) ? res.data : [];

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
      }
    });
  }


  LimpiarProducto() {

    this.ProductoSeleccionado = null;

    this.CantidadProducto = 0;

    this.Filtros['Producto'] = '';

    this.MostrarListas['Producto'] = false;

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
  Filtrados(tipo: string, lista: any[], campo?: string) {
    if (!lista) return [];

    const filtro = (this.Filtros[tipo] || '').toLowerCase();

    return lista.filter(item => {
      if (tipo === 'Producto') {
        return (
          item.NombreProducto?.toLowerCase().includes(filtro) ||
          item.CodigoBarras?.toLowerCase().includes(filtro) // ← CORRECTO
        );
      }

      return campo ? item[campo]?.toLowerCase().includes(filtro) : false;
    });
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
      this.Venta.Cliente = item;
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

    // Asignar el total al pago automáticamente
    // Esto asegura que el campo Pago nunca esté vacío
    this.Venta.Pago = this.Total;
  }
  // Guardar venta
  GuardarVenta() {

    // =========================
    // LISTA DE ERRORES INTERNOS
    // =========================

    const errores: string[] = [];

    if (!this.ClienteSeleccionado)
      errores.push('Cliente');

    if (!this.ProductosVenta || this.ProductosVenta.length === 0)
      errores.push('Producto');

    if (!this.Venta.FormaPago)
      errores.push('Forma de pago');

    if (!this.Venta.Pago || this.Venta.Pago <= 0)
      errores.push('Pago');

    if (this.EsTarjeta() && !this.Venta.Referencia)
      errores.push('Referencia de tarjeta');

    // =========================
    // ALERTAS
    // =========================

    if (errores.length > 0) {

      if (errores.length === 1) {

        this.Alerta.MostrarAlerta(`Falta ${errores[0]}`);

      } else {

        this.Alerta.MostrarAlerta(
          `Debe completar los siguientes campos obligatorios: ${errores.join(', ')}`
        );

      }

      return;
    }

    if (this.Venta.Pago < this.Total) {
      this.Alerta.MostrarAlerta('El pago no puede ser menor al total');
      return;
    }

    // =========================
    // SPINNER
    // =========================

    this.Procesando = true;

    // =========================
    // OBJETO VENTA
    // =========================

    const venta = {

      CodigoCliente: this.Venta.Cliente.CodigoCliente,
      CodigoFormaPago: this.Venta.FormaPago,
      Descuento: this.DescuentoAplicado || 0,
      Pago: this.Venta.Pago,
      Subtotal: this.Subtotal,
      Total: this.Total,

      NumeroComprobante: this.EsTarjeta()
        ? this.Venta.Referencia
        : null,

      Productos: this.ProductosVenta.map(p => ({
        CodigoInventario: p.CodigoInventario,
        Cantidad: p.Cantidad,
        PrecioVenta: p.PrecioVenta,
        Total: p.Total
      }))
    };

    // =========================
    // API
    // =========================

    this.VentaServicio.CrearVenta(venta).subscribe({

      next: (res: any) => {

        this.Procesando = false;

        if (res && res.success) {

          this.Alerta.MostrarExito('Venta creada correctamente');
          this.LimpiarVenta();

        } else {

          this.Alerta.MostrarError(
            res?.message || 'No se pudo crear la venta'
          );

        }

      },

      error: (err) => {

        this.Procesando = false;
        this.Alerta.MostrarError(err);

      }

    });

  }
  ActualizarDescuento() {

    this.DescuentoAplicado = this.Venta.Descuento || 0;

    this.CalcularTotales();

  }
  LimpiarVenta() {

    this.Venta = {
      Cliente: null,
      Descuento: 0,
      FormaPago: null,
      Pago: 0,
      Referencia: null
    };

    this.ClienteSeleccionado = null;
    this.ProductoSeleccionado = null;

    this.ProductosVenta = [];

    this.Subtotal = 0;
    this.Total = 0;

    this.DescuentoAplicado = 0;
    this.CantidadProducto = 0;

    this.Filtros = {};
    this.MostrarListas = {};

  }
  EsTarjeta(): boolean {

    if (!this.Venta.FormaPago) return false;

    const forma = this.FormasPago.find(
      x => x.CodigoFormaPago === this.Venta.FormaPago
    );

    if (!forma) return false;

    return forma.NombreFormaPago?.toLowerCase().includes('tarjeta');
  }
}
