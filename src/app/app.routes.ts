import { Routes } from '@angular/router';
import { AutorizacionRuta } from './Autorizacion/AutorizacionRuta';
import { LoginComponent } from '../app/Paginas/Autorizacion/login/login.component';
import { LoginGuard } from './Servicios/loginGuard';
import { MenuComponent } from './Paginas/Inicio/menu/menu.component';
import { ClienteComponent } from '../app/Paginas/Inicio/Clientes/cliente/cliente.component';
import { GestionClienteComponent } from '../app/Paginas/Inicio/Clientes/gestion-cliente/gestion-cliente.component';
import { PedidoListadoComponent } from '../app/Paginas/Inicio/HistorialPedido/pedido-listado/pedido-listado.component';
import { PedidoGestionComponent } from '../app/Paginas/Inicio/HistorialPedido/pedido-gestion/pedido-gestion.component';
import { PedidoHistorialComponent } from '../app/Paginas/Inicio/HistorialPedido/pedido-historial/pedido-historial.component';
import { PedidoHistorialListadoComponent } from '../app/Paginas/Inicio/HistorialPedido/pedido-historial-listado/pedido-historial-listado.component';
import { InventarioGestionComponent } from '../app/Paginas/Inicio/Inventario/inventario-gestion/inventario-gestion.component';
import { InventarioListadoComponent } from '../app/Paginas/Inicio/Inventario/inventario-listado/inventario-listado.component';
import { VentaGestionComponent } from '../app/Paginas/Inicio/Ventas/venta-gestion/venta-gestion.component';
import { VentaListadoComponent } from '../app/Paginas/Inicio/Ventas/venta-listado/venta-listado.component';
import { ConfiguracionListadoComponent } from '../app/Paginas/Inicio/Configuracion/configuracion-listado/configuracion-listado.component';
import { ConfiguracionGestionComponent } from '../app/Paginas/Inicio/Configuracion/configuracion-gestion/configuracion-gestion.component';
import { VentaImpresionComponent } from '../app/Paginas/Inicio/Ventas/venta-impresion/venta-impresion.component';
import { SpinnerGlobalComponent } from '../app/Componentes/spinner-global/spinner-global.component';
import { ReporteVentaComponent } from './Paginas/Inicio/Reportes/reporte-venta/reporte-venta.component';
import { ReportePedidoComponent } from './Paginas/Inicio/Reportes/reporte-pedido/reporte-pedido.component';
import { MenuOficialComponent } from './Paginas/Inicio/Anexos/Oficial/menu-oficial/menu-oficial.component';
import { MenuAsociadaComponent } from './Paginas/Inicio/Anexos/Asociada/menu-asociada/menu-asociada.component';
import { PagoImpresionComponent } from './Paginas/Inicio/HistorialPedido/pago-impresion/pago-impresion.component';
import { ReportePedidoAnexoComponent } from './Paginas/Inicio/Reportes/reporte-pedido-anexo/reporte-pedido-anexo.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },

  //Rutas publicas


  //Rutas protegidas
  { path: 'menu', component: MenuComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'cliente', component: ClienteComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL', 'EMPRESA_ASOCIADA'] } },
  { path: 'gestion-cliente', component: GestionClienteComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL', 'EMPRESA_ASOCIADA'] } },
  { path: 'gestion-cliente/:codigo', component: GestionClienteComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL', 'EMPRESA_ASOCIADA'] } },
  { path: 'pedido-listado', component: PedidoListadoComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL', 'EMPRESA_ASOCIADA'] } },
  { path: 'pedido-gestion', component: PedidoGestionComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL', 'EMPRESA_ASOCIADA'] } },
  { path: 'pedido-gestion/:codigo', component: PedidoGestionComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL', 'EMPRESA_ASOCIADA'] } },
  { path: 'pedido-historial/:codigo', component: PedidoHistorialComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL', 'EMPRESA_ASOCIADA'] } },
  { path: 'pedido-historial-listado', component: PedidoHistorialListadoComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL', 'EMPRESA_ASOCIADA'] } },
  { path: 'inventario-listado', component: InventarioListadoComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'inventario-gestion', component: InventarioGestionComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'inventario-gestion/:CodigoInventario', component: InventarioGestionComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'venta-gestion', component: VentaGestionComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'venta-listado', component: VentaListadoComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'venta-impresion/:codigoPedido', component: VentaImpresionComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'configuracion-listado', component: ConfiguracionListadoComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'configuracion-gestion', component: ConfiguracionGestionComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'configuracion-gestion/:codigoinventario', component: ConfiguracionGestionComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'reporte-venta', component: ReporteVentaComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'reporte-pedido', component: ReportePedidoComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'reporte-pedido-anexo', component: ReportePedidoAnexoComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'menu-asociada', component: MenuAsociadaComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_ASOCIADA'] } },
  { path: 'menu-oficial', component: MenuOficialComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },
  { path: 'spinner-global', component: SpinnerGlobalComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_ASOCIADA'] } },
  { path: 'pago-impresion/:CodigoPago', component: PagoImpresionComponent, canActivate: [AutorizacionRuta], data: { roles: ['EMPRESA_OFICIAL'] } },


  { path: '**', redirectTo: 'login' },
];
