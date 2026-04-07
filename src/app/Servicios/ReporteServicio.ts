
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';

@Injectable({
    providedIn: 'root'
})
export class ReporteServicio {

    private Url = `${Entorno.ApiUrl}reporte`;

    constructor(private http: HttpClient) { }


    ReporteVentas(
        FechaInicio?: string,
        FechaFin?: string
    ): Observable<any> {

        let url = `${this.Url}/ventas`;

        if (FechaInicio && FechaFin) {
            url += `?FechaInicio=${FechaInicio}&FechaFin=${FechaFin}`;
        }

        return this.http.get(url);
    }

    ReportePedidos(
        FechaInicio?: string,
        FechaFin?: string
    ): Observable<any> {

        let url = `${this.Url}/pedidos`;

        if (FechaInicio && FechaFin) {
            url += `?FechaInicio=${FechaInicio}&FechaFin=${FechaFin}`;
        }

        return this.http.get(url);
    }

}