import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';

@Injectable({
    providedIn: 'root'
})
export class InventarioServicio {

    private Url = `${Entorno.ApiUrl}inventario`;

    constructor(private http: HttpClient) { }

    CrearProductoInventario(Datos: any): Observable<any> {
        return this.http.post(`${this.Url}/crear`, Datos);
    }

    ListadoTipoProducto(): Observable<any> {
        return this.http.get(`${this.Url}/tipo-producto`);
    }

    ListadoMarca(): Observable<any> {
        return this.http.get(`${this.Url}/marcas`);
    }

    ListadoEstilo(): Observable<any> {
        return this.http.get(`${this.Url}/estilos`);
    }

    ListadoTalla(): Observable<any> {
        return this.http.get(`${this.Url}/tallas`);
    }

    ListadoColor(): Observable<any> {
        return this.http.get(`${this.Url}/colores`);
    }

    ListadoInventario(CodigoEmpresa: number): Observable<any> {
        return this.http.get(`${this.Url}/listado/${CodigoEmpresa}`);
    }

    EliminarInventario(CodigoInventario: number): Observable<any> {
        return this.http.delete(`${this.Url}/eliminar/${CodigoInventario}`);
    }

    ListadoInventarioEliminados(CodigoEmpresa: number): Observable<any> {
        return this.http.get(`${this.Url}/eliminados/${CodigoEmpresa}`);
    }

    RestaurarInventario(CodigosInventario: number | number[]): Observable<any> {
        return this.http.post(`${this.Url}/restaurar`, { CodigosInventario });
    }

    ObtenerInventarioPorCodigo(CodigoInventario: number): Observable<any> {
        return this.http.get(`${this.Url}/obtener/${CodigoInventario}`);
    }

    ActualizarProductoInventario(CodigoInventario: number, Datos: any): Observable<any> {
        return this.http.put(`${this.Url}/actualizar/${CodigoInventario}`, Datos);
    }

    CrearMarca(Datos: any): Observable<any> {
        return this.http.post(`${this.Url}/marca`, Datos);
    }

    CrearEstilo(Datos: any): Observable<any> {
        return this.http.post(`${this.Url}/estilo`, Datos);
    }

    CrearTalla(Datos: any): Observable<any> {
        return this.http.post(`${this.Url}/talla`, Datos);
    }

    CrearColor(Datos: any): Observable<any> {
        return this.http.post(`${this.Url}/color`, Datos);
    }
    //ACTUALIZAR
    ActualizarMarca(Datos: any): Observable<any> {
        return this.http.put(`${this.Url}/marca`, Datos);
    }

    ActualizarEstilo(Datos: any): Observable<any> {
        return this.http.put(`${this.Url}/estilo`, Datos);
    }

    ActualizarTalla(Datos: any): Observable<any> {
        return this.http.put(`${this.Url}/talla`, Datos);
    }

    ActualizarColor(Datos: any): Observable<any> {
        return this.http.put(`${this.Url}/color`, Datos);
    }
    //OBTENER POR CODIGO:
    ObtenerMarcaPorCodigo(CodigoMarca: number): Observable<any> {
        return this.http.get(`${this.Url}/marca/${CodigoMarca}`);
    }

    ObtenerEstiloPorCodigo(CodigoEstilo: number): Observable<any> {
        return this.http.get(`${this.Url}/estilo/${CodigoEstilo}`);
    }

    ObtenerTallaPorCodigo(CodigoTalla: number): Observable<any> {
        return this.http.get(`${this.Url}/talla/${CodigoTalla}`);
    }

    ObtenerColorPorCodigo(CodigoColor: number): Observable<any> {
        return this.http.get(`${this.Url}/color/${CodigoColor}`);
    }
}