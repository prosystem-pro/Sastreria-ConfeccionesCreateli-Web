// configuracion-servicio.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';

@Injectable({
    providedIn: 'root'
})
export class ConfiguracionServicio {

    private Url = `${Entorno.ApiUrl}configuracion`;

    constructor(private http: HttpClient) { }

    CrearProductoInventario(Datos: any): Observable<any> {
        return this.http.post(`${this.Url}/crear`, Datos);
    }

    ObtenerInventarioListado(CodigoEmpresa: number): Observable<any> {
        return this.http.get(`${this.Url}/listado/${CodigoEmpresa}`);
    }

    ObtenerInventarioEliminados(CodigoEmpresa: number): Observable<any> {
        return this.http.get(`${this.Url}/eliminados/${CodigoEmpresa}`);
    }

    EliminarInventario(CodigoInventario: number): Observable<any> {
        return this.http.delete(`${this.Url}/eliminar/${CodigoInventario}`);
    }

    RestaurarInventario(codigos: number[]) {

        return this.http.post(
            `${this.Url}/restaurar`,
            {
                CodigosInventario: codigos
            }
        );

    }

    ActualizarProductoInventario(CodigoInventario: number, Datos: any): Observable<any> {
        return this.http.put(`${this.Url}/actualizar/${CodigoInventario}`, Datos);
    }

    ObtenerInventarioPorCodigo(CodigoInventario: number): Observable<any> {
        return this.http.get(`${this.Url}/obtener/${CodigoInventario}`);
    }


    ListadoTipoTela(): Observable<any> {
        return this.http.get(`${this.Url}/listado-tipo-tela`);
    }
    ListadoProducto(): Observable<any> {
        return this.http.get(`${this.Url}/listado-producto`);
    }

    ListadoTela(CodigoTipoTela: number): Observable<any> {
        return this.http.get(`${this.Url}/listado-tela/${CodigoTipoTela}`);
    }
    ListadoTelaCompleto(): Observable<any> {
    return this.http.get(`${this.Url}/listado-tela-completo`);
}
    CrearTipoTela(Datos: any): Observable<any> {
        return this.http.post(`${this.Url}/crear-tipo-tela`, Datos);
    }

    ObtenerTipoTelaPorCodigo(codigo: number): Observable<any> {
        return this.http.get(`${this.Url}/obtener-tipo-tela/${codigo}`);
    }

    EditarTipoTela(codigo: number, Datos: any): Observable<any> {
        return this.http.put(`${this.Url}/editar-tipo-tela/${codigo}`, Datos);
    }


    // TELA
    CrearTela(Datos: any): Observable<any> {
        return this.http.post(`${this.Url}/crear-tela`, Datos);
    }

    ObtenerTelaPorCodigo(codigo: number): Observable<any> {
        return this.http.get(`${this.Url}/obtener-tela/${codigo}`);
    }

    EditarTela(codigo: number, Datos: any): Observable<any> {
        return this.http.put(`${this.Url}/editar-tela/${codigo}`, Datos);
    }
    EliminarTipoTela(codigo: number): Observable<any> {
        return this.http.delete(`${this.Url}/eliminar-tipo-tela/${codigo}`);
    }

    EliminarTela(codigo: number): Observable<any> {
        return this.http.delete(`${this.Url}/eliminar-tela/${codigo}`);
    }

    CrearVariacionInventario(Datos: any): Observable<any> {
        return this.http.post(`${this.Url}/crear-variacion`, Datos);
    }
}