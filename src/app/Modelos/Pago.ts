export interface Pago {
  CodigoPago?: number;
  CodigoEmpresa?: number;
  CodigoFormaPago?: number;
  CodigoUsuario?: number;
  FechaPago?: Date;
  Monto?: number;
  NumeroComprobante?: string;
  UrlImagen?: string;
  Observacion?: string;
  Estatus?: boolean;
  FechaCreacion?: Date;
}
