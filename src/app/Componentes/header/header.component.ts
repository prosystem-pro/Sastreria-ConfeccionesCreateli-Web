import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmpresaServicio } from '../../Servicios/EmpresaServicio';
import { LoginServicio } from '../../Servicios/LoginServicio';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  MenuAbierto = false;
  NombreEmpresa: string = '';
  Rol: string | null = null;
  SuperAdmin: number | null = null;

  constructor(private EmpresaServicio: EmpresaServicio, private LoginServicio: LoginServicio, private Router: Router) { }

  ngOnInit(): void {
    const payload = this.LoginServicio.ObtenerPayloadToken();
    this.Rol = payload?.NombreRol || null;
    this.SuperAdmin = payload?.SuperAdmin || null;
  }

  CargarEmpresa() {
    this.EmpresaServicio.ObtenerEmpresaPrincipal().subscribe({
      next: (resp) => {
        if (resp?.data && resp.data.length > 0) {
          this.NombreEmpresa = resp.data[0].NombreEmpresa;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  toggleMenu() {

    this.MenuAbierto = !this.MenuAbierto;

    if (this.MenuAbierto && !this.NombreEmpresa) {
      this.CargarEmpresa();
    }

  }

  CerrarMenu() {
    this.MenuAbierto = false;
  }

  CerrarSesion() {
    this.LoginServicio.EliminarToken();
    this.LoginServicio.EliminarUsuario();

    this.MenuAbierto = false;

    this.Router.navigate(['/login']);
  }

  IrARuta(ruta: string) {
    this.MenuAbierto = false;
    this.Router.navigate([ruta]);
  }

  EsLogin(): boolean {
    return this.Router.url === '/login';
  }

  EsSuperAdmin(): boolean {
    return this.SuperAdmin === 1;
  }

  EsOficial(): boolean {
    return this.Rol === 'EMPRESA_OFICIAL';
  }

  EsAsociada(): boolean {
    return this.Rol === 'EMPRESA_ASOCIADA';
  }
}
