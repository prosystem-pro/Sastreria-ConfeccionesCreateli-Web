import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BorradorPedidoService {

  private pedidoBorrador: any = null;

  constructor() { }

  GuardarPedido(pedido: any) {
    this.pedidoBorrador = pedido;
  }

  ObtenerPedido() {
    return this.pedidoBorrador;
  }

  LimpiarPedido() {
    this.pedidoBorrador = null;
  }

}