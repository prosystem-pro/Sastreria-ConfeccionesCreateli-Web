export interface MovimientoInventario {
  CodigoMovimientoInventario?: number;
  CodigoEmpresa?: number;
  CodigoInventario?: number;
  CodigoUsuario?: number;
  TipoMovimiento?: string;
  OrigenMovimiento?: string;
  CodigoDocumento?: number;
  Cantidad?: number;
  StockAnterior?: number;
  StockNuevo?: number;
  Observacion?: string;
  FechaMovimiento?: Date;
}
