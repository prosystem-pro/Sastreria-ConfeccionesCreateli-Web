// Servicios/HistorialPedidoServicio.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class HistorialPedidoServicio {
    private Url = `${Entorno.ApiUrl}historialpedido`;

    constructor(private http: HttpClient) { }

    Listado(verOtros: boolean = false): Observable<any> {

        let params = new HttpParams();

        if (verOtros) {
            params = params.set('verOtros', 'true');
        }

        return this.http.get(`${this.Url}/listado`, { params });
    }

    Obtener(codigo: number): Observable<any> {
        return this.http.get(`${this.Url}/obtener/${codigo}`);
    }

    ListadoTipoProducto(): Observable<any> {
        return this.http.get(`${this.Url}/tipo-producto`);
    }

    ListadoTipoTela(): Observable<any> {
        return this.http.get(`${this.Url}/tipo-tela`);
    }

    ListadoTela(): Observable<any> {
        return this.http.get(`${this.Url}/tela`);
    }

    ListadoProducto(codigoTipoProducto?: number): Observable<any> {

        let url = `${this.Url}/producto`;

        if (codigoTipoProducto) {
            url += `?CodigoTipoProducto=${codigoTipoProducto}`;
        }

        return this.http.get(url);
    }

    ListadoTipoCuello(): Observable<any> {
        return this.http.get(`${this.Url}/tipo-cuello`);
    }

    ObtenerProducto(codigo: number): Observable<any> {
        return this.http.get(`${this.Url}/producto/${codigo}`);
    }

    ListadoCliente(): Observable<any> {
        return this.http.get(`${this.Url}/cliente`);
    }

    ListadoFormaPago(): Observable<any> {
        return this.http.get(`${this.Url}/forma-pago`);
    }

    CrearPedido(pedido: any): Observable<any> {
        return this.http.post(`${this.Url}/crear`, pedido);
    }

    ObtenerPedido(CodigoPedido: number): Observable<any> {
        return this.http.get(`${this.Url}/obtener-pedido/${CodigoPedido}`);
    }

    ActualizarPedido(pedido: any): Observable<any> {
        return this.http.put(`${this.Url}/actualizar`, pedido);
    }

    RegistrarPagoPedido(pago: any): Observable<any> {
        return this.http.post(`${this.Url}/pagar`, pago);
    }
    ListadoPagosPorPedido(CodigoPedido: number): Observable<any> {
        return this.http.get(`${this.Url}/pagos/${CodigoPedido}`);
    }
    EliminarPedido(CodigoPedido: number): Observable<any> {
        return this.http.delete(`${this.Url}/eliminar/${CodigoPedido}`);
    }
    ListadoEstadoPedido(): Observable<any> {
        return this.http.get(`${this.Url}/estado-pedido`);
    }
    ListadoEntregados(verOtros: boolean = false): Observable<any> {

        let params = new HttpParams();

        if (verOtros) {
            params = params.set('verOtros', 'true');
        }

        return this.http.get(`${this.Url}/entregados`, { params });
    }

    DescargarPDFPedido(CodigoPedido: number): Observable<Blob> {
        return this.http.get(`${this.Url}/pdf/${CodigoPedido}`, { responseType: 'blob' });
    }

    DescargarPDFPagoPedido(CodigoPago: number): Observable<Blob> {
        return this.http.get(
            `${this.Url}/pdf-pago/${CodigoPago}`,
            { responseType: 'blob' }
        );
    }
}