import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ClienteServicio {
    private Url = `${Entorno.ApiUrl}cliente`;

    constructor(private http: HttpClient) { }

    Listado(): Observable<any> {
        return this.http.get(`${this.Url}/listado`);
    }

    Obtener(codigo: number): Observable<any> {
        return this.http.get(`${this.Url}/obtener/${codigo}`);
    }

    Crear(datos: any): Observable<any> {
        return this.http.post(`${this.Url}/crear`, datos);
    }

    Editar(codigo: number, datos: any): Observable<any> {
        return this.http.put(`${this.Url}/editar/${codigo}`, datos);
    }

    Eliminar(codigo: number): Observable<any> {
        return this.http.delete(`${this.Url}/eliminar/${codigo}`);
    }

}