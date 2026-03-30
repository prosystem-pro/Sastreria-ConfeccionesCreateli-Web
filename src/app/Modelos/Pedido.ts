export interface Pedido {
  CodigoPedido?: number;
  CodigoEmpresa?: number;
  CodigoCliente?: number;
  CodigoEstadoPedido?: number;
  CodigoUsuario?: number;
  FechaCreacion?: Date;
  FechaEntrega?: Date;
  Subtotoal?: number;
  Descuento?: number;
  Total?: number;
  Observaciones?: string;
  Estatus?: any;
}
