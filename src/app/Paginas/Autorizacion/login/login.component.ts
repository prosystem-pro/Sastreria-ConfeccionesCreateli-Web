import { Component } from '@angular/core';
import { LoginServicio } from '../../../Servicios/LoginServicio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AlertaServicio } from '../../../Servicios/Alerta-Servicio';
import { SpinnerGlobalComponent } from '../../../Componentes/spinner-global/spinner-global.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, SpinnerGlobalComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  CentrarVertical = true;
  NombreUsuario: string = '';
  Clave: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  Procesando = false;
  constructor(
    private LoginServicio: LoginServicio,
    private Router: Router,
    private alertaServicio: AlertaServicio
  ) { }

  login(): void {
    this.Procesando = true;

    this.LoginServicio.Login(this.NombreUsuario, this.Clave).subscribe({

      next: (response) => {

        if (response?.data?.Token) {

          const usuario = response?.data?.usuario;
          const rol = usuario?.NombreRol;
          const esSuperAdmin = usuario?.SuperAdmin === 1;

          // 🔴 PRIORIDAD MÁXIMA
          if (esSuperAdmin) {
            this.Router.navigate(['/menu']);
          }
          else if (rol === 'EMPRESA_OFICIAL') {
            this.Router.navigate(['/menu']);
          }
          else if (rol === 'EMPRESA_ASOCIADA') {
            this.Router.navigate(['/menu-asociada']);
          }
          else {
            this.alertaServicio.MostrarError({
              error: { message: 'Rol no autorizado' }
            });
          }

          this.Procesando = false;

        }
        this.Procesando = false;

      },

      error: (error) => {
        const tipo = error?.error?.tipo;
        const mensaje =
          error?.error?.error?.message ||
          error?.error?.message ||
          'Ocurrió un error inesperado';

        if (tipo === 'Alerta') {
          this.alertaServicio.MostrarAlerta(mensaje);
        }
        else if (tipo === 'Error') {
          this.alertaServicio.MostrarError(error);
        }
        else {
          this.alertaServicio.MostrarError(error);
        }

        this.Procesando = false;

      }

    });

  }

  EsLogin(): boolean {
    return this.Router.url === '/login';
  }
}