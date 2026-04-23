import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';

@Injectable({
  providedIn: 'root'
})
export class AnexoEmpresaOficialServicio {

  private Url = `${Entorno.ApiUrl}anexoempresaoficial`;

  constructor(private http: HttpClient) { }

  Listado(): Observable<any> {
    return this.http.get(`${this.Url}/listado`);
  }
  EliminarPedido(CodigoPedido: number): Observable<any> {
    return this.http.delete(`${this.Url}/eliminar/${CodigoPedido}`);
  }
}