import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { HistorialPedidoServicio } from '../../../../Servicios/HistorialPedidoServicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';

@Component({
  selector: 'app-pedido-historial',
  imports: [CommonModule, FormsModule, SpinnerGlobalComponent],
  templateUrl: './pedido-historial.component.html',
  styleUrl: './pedido-historial.component.css'
})

export class PedidoHistorialComponent {
  VerOtros: boolean = false;
  // ==============================
  // UI / ESTADO
  // ==============================
  MostrarPedido = true;
  MostrarProductos = false;
  MostrarMedidas = false;
  MostrarPagos = false;
  Procesando = false;
  Modo: 'CREAR' | 'EDITAR' = 'CREAR';

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

  EstadoPedido: any[] = [];
  ProductoMedidas: any = null;
  ListaPagos: any[] = [];
  TotalAbonadoPagos = 0;

  // ==============================
  // MEDIDAS
  // ==============================
  TituloMedidas: any = {
    TipoCuello: { label: 'Tipo de cuello', tipo: 'select' },
    Largo: { label: 'Largo', tipo: 'number' },
    Espalda: { label: 'Espalda', tipo: 'number' },
    LargoManga: { label: 'Largo de Manga', tipo: 'number' },
    AnchoBrazo: { label: 'Ancho de brazo', tipo: 'number' },
    Pecho: { label: 'Pecho', tipo: 'number' },
    Cintura: { label: 'Cintura', tipo: 'number' },
    CinturaT: { label: 'Cintura Terminada', tipo: 'number' },
    Cuello: { label: 'Cuello', tipo: 'number' },
    Solapa: { label: 'Solapa', tipo: 'select' },
    TipoCorte: { label: 'Tipo Corte', tipo: 'select' },
    Botones: { label: 'Botones', tipo: 'select' },
    Abertura: { label: 'Abertura', tipo: 'select' },
    Talle: { label: 'Talle', tipo: 'number' },
    EspaldaBaja: { label: 'Espalda baja', tipo: 'number' },
    FrentePecho: { label: 'Frente de pecho', tipo: 'number' },
    Diseno: { label: 'Diseño', tipo: 'select' },
    Categoria: { label: 'Categoría', tipo: 'select' },
    Cadera: { label: 'Cadera', tipo: 'number' },
    Rodilla: { label: 'Rodilla', tipo: 'number' },
    Ruedo: { label: 'Ruedo', tipo: 'number' },
    Tiro: { label: 'Tiro', tipo: 'number' },
    EntrePierna: { label: 'Entrepiernas', tipo: 'number' },
    Tamano: { label: 'Tamaño', tipo: 'select' },
    Descripcion: { label: 'Detalle personalizado', tipo: 'textarea' }
  };

  MedidasPorProducto: { [key: string]: string[] } = {
    Camisa: ['TipoCuello', 'Largo', 'Espalda', 'LargoManga', 'AnchoBrazo', 'Pecho', 'Cintura', 'CinturaT', 'Cuello', 'Descripcion'],
    Saco: ['Solapa', 'TipoCorte', 'Botones', 'Abertura', 'Talle', 'Largo', 'Espalda', 'EspaldaBaja', 'LargoManga', 'AnchoBrazo', 'Pecho', 'Cintura', 'CinturaT', 'FrentePecho', 'Descripcion'],
    Pantalon: ['Diseno', 'Categoria', 'Largo', 'Cintura', 'Cadera', 'Rodilla', 'Ruedo', 'Tiro', 'EntrePierna', 'Descripcion'],
    Chaleco: ['Diseno', 'Botones', 'Talle', 'Espalda', 'Pecho', 'Cintura', 'Descripcion'],
    Corbata: ['Tamano', 'Descripcion'],
    Corbatin: ['Tamano', 'Descripcion'],
    //NUEVAS MEDIDAS
    Filipina: ['TipoCuello', 'Largo', 'Espalda', 'LargoManga', 'AnchoBrazo', 'Pecho', 'Cintura', 'CinturaT', 'Cuello', 'Descripcion'],
    Chumpa: ['TipoCuello', 'Largo', 'Espalda', 'LargoManga', 'AnchoBrazo', 'Pecho', 'Cintura', 'CinturaT', 'Cuello', 'Descripcion'],
    Gabacha: ['TipoCuello', 'Largo', 'Espalda', 'LargoManga', 'AnchoBrazo', 'Pecho', 'Cintura', 'CinturaT', 'Cuello', 'Descripcion'],
    Bata: ['TipoCuello', 'Largo', 'Espalda', 'LargoManga', 'AnchoBrazo', 'Pecho', 'Cintura', 'CinturaT', 'Cuello', 'Descripcion'],
    Blazer: ['Solapa', 'TipoCorte', 'Botones', 'Abertura', 'Talle', 'Largo', 'Espalda', 'EspaldaBaja', 'LargoManga', 'AnchoBrazo', 'Pecho', 'Cintura', 'CinturaT', 'FrentePecho', 'Descripcion'],
    Falda: ['Diseno', 'Categoria', 'Largo', 'Cintura', 'Cadera', 'Rodilla', 'Ruedo', 'Tiro', 'EntrePierna', 'Descripcion'],
  };

  // ==============================
  // CONSTRUCTOR
  // ==============================
  constructor(
    private Router: Router,
    private Route: ActivatedRoute,
    private HistorialPedidoServicio: HistorialPedidoServicio,
    private AlertaServicio: AlertaServicio
  ) { }

  // ==============================
  // UTILIDADES
  // ==============================
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

    //NUEVAS MEDIDAS
    if (nombre.includes('filipina')) return this.MedidasPorProducto['Filipina'];
    if (nombre.includes('chumpa')) return this.MedidasPorProducto['Chumpa'];
    if (nombre.includes('gabacha')) return this.MedidasPorProducto['Gabacha'];
    if (nombre.includes('bata')) return this.MedidasPorProducto['Bata'];
    if (nombre.includes('blazer')) return this.MedidasPorProducto['Blazer'];
    if (nombre.includes('falda')) return this.MedidasPorProducto['Falda'];
    return [];
  }

  ObtenerCamposPorTipo(tipo: string): string[] {
    const campos = this.ObtenerCamposMedidas(this.ProductoMedidas);
    return campos.filter(c => this.TituloMedidas[c]?.tipo === tipo);
  }

  ObtenerCamposNoDescripcion(): string[] {
    const campos = this.ObtenerCamposMedidas(this.ProductoMedidas);
    return campos.filter(c => this.TituloMedidas[c]?.tipo !== 'textarea' && this.TituloMedidas[c]?.tipo !== 'select');
  }

  ObtenerDescripcion(): string[] {
    const campos = this.ObtenerCamposMedidas(this.ProductoMedidas);
    return campos.filter(c => this.TituloMedidas[c]?.tipo === 'textarea');
  }

  ObtenerPlaceholder(campo: string): string {
    const label = this.TituloMedidas[campo]?.label || '';
    return 'Ingrese ' + label.split('-').pop()?.trim();
  }

  // ==============================
  // LIFECYCLE
  // ==============================
  ngOnInit() {
    const codigo = this.Route.snapshot.paramMap.get('codigo');
    if (codigo) {
      this.Modo = 'EDITAR';
      this.CargarPedido(Number(codigo));
    }

    this.VerOtros = this.Route.snapshot.queryParamMap.get('verOtros') === 'true';

    this.CargarEstadoPedido();
  }

  // ==============================
  // CARGA DE DATOS
  // ==============================
  CargarEstadoPedido() {
    this.HistorialPedidoServicio.ListadoEstadoPedido().subscribe((res: any) => this.EstadoPedido = res.data);
  }

  CargarPedido(codigo: number) {
    this.Procesando = true;
    this.HistorialPedidoServicio.ObtenerPedido(codigo).subscribe((res: any) => {
      const data = res.data;
      console.log('ira', data)
      this.Pedido = {

        CodigoPedido: data.CodigoPedido,
        CodigoCliente: data.CodigoCliente || null,
        NombreCliente: data.NombreCliente || '',
        NombreEmpresa: data.NombreEmpresa || '', // 🔥 AQUI
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
              TipoCuello: medidas.TipoCuello ?? null,

              Largo: medidas.Largo ?? null,
              Espalda: medidas.Espalda ?? null,
              LargoManga: medidas.LargoManga ?? null,
              AnchoBrazo: medidas.AnchoBrazo ?? null,
              Pecho: medidas.Pecho ?? null,
              Cintura: medidas.Cintura ?? null,
              CinturaT: medidas.CinturaT ?? null,
              Cuello: medidas.Cuello ?? null,
              Descripcion: medidas.Descripcion ?? '',

              Solapa: medidas.Solapa ?? '',
              TipoCorte: medidas.TipoCorte ?? '',
              Botones: medidas.Botones ?? '',
              Abertura: medidas.Abertura ?? '',

              Talle: medidas.Talle ?? null,
              EspaldaBaja: medidas.EspaldaBaja ?? null,
              FrentePecho: medidas.FrentePecho ?? null,

              Diseno: medidas.Diseno ?? '',
              Categoria: medidas.Categoria ?? '',

              Cadera: medidas.Cadera ?? null,
              Rodilla: medidas.Rodilla ?? null,
              Ruedo: medidas.Ruedo ?? null,
              Tiro: medidas.Tiro ?? null,
              EntrePierna: medidas.EntrePierna ?? null,

              Tamano: medidas.Tamano ?? ''
            }
          };
        }) || []
      };
      this.Procesando = false;
    });
  }

  // ==============================
  // PRODUCTOS
  // ==============================
  AbrirMedidas(prod: any) {
    if (prod.NombreTipoProducto === 'FISICO') {
      this.AlertaServicio.MostrarAlerta('Este producto no requiere medidas');
      return;
    }
    this.ProductoMedidas = prod;
    this.MostrarProductos = false;
    this.MostrarMedidas = true;
  }

  VolverProductos() {
    this.MostrarMedidas = false;
    this.MostrarProductos = true;
  }

  AbrirProductos() {
    this.MostrarPedido = false;
    this.MostrarProductos = true;
  }

  // ==============================
  // PAGOS
  // ==============================
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

  CargarPagos() {
    if (!this.Pedido?.CodigoPedido) return;
    this.HistorialPedidoServicio.ListadoPagosPorPedido(this.Pedido.CodigoPedido).subscribe({
      next: (resp: any) => {
        this.ListaPagos = resp?.data || [];
        this.TotalAbonadoPagos = this.ListaPagos.reduce((total: number, p: any) => total + Number(p.Monto || 0), 0);
      },
      error: () => {
        this.ListaPagos = [];
        this.TotalAbonadoPagos = 0;
      }
    });
  }

  // ==============================
  // NAVEGACIÓN
  // ==============================
  IrARuta(ruta: string) {

    const verOtros = this.Route.snapshot.queryParamMap.get('verOtros');

    this.Router.navigate([ruta], {
      queryParams: verOtros === 'true' ? { verOtros: 'true' } : {}
    });

  }

  // ==============================
  // ARRASTRE DE PAGOS
  // ==============================
  ArrastrePago(event: PointerEvent, pago: any, fila: any) {
    const inicioX = event.clientX;
    const elemento = fila as HTMLElement;
    elemento.style.transition = 'none';

    const mover = (e: PointerEvent) => {
      const desplazamiento = Math.max(0, e.clientX - inicioX);
      elemento.style.transform = `translateX(${desplazamiento}px)`;
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
  DescargarPDFPago(CodigoPago: number) {

    this.Procesando = true;
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
}
