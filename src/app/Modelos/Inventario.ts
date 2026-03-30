export interface Inventario {
  CodigoInventario?: number;
  CodigoEmpresa?: number;
  CodigoProducto?: number;
  CodigoMarca?: number;
  CodigoEstilo?: number;
  CodigoTalla?: number;
  CodigoTamano?: number;
  CodigoColor?: number;
  CodigoBarras?: string;
  PrecioVenta?: number;
  StockActual?: number;
  StockMinimo?: number;
  StockMaxicmo?: number;
  Estatus?: number;
}
