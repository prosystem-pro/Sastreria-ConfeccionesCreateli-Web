import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';

@Injectable({
    providedIn: 'root'
})
export class VentaServicio {

    private Url = `${Entorno.ApiUrl}venta`;

    constructor(private http: HttpClient) { }

    ListadoProducto(): Observable<any> {
        return this.http.get(`${this.Url}/listado-producto`);
    }

    CrearVenta(venta: any): Observable<any> {
        return this.http.post(`${this.Url}/crear-venta`, venta);
    }

    ListadoVentas(): Observable<any> {
        return this.http.get(`${this.Url}/listado-ventas`);
    }

    EliminarVenta(CodigoPedido: number): Observable<any> {
        return this.http.delete(`${this.Url}/eliminar-venta/${CodigoPedido}`);
    }

}