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

}