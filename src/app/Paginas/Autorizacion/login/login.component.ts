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
    this.errorMessage = '';
    this.isLoading = true;

    this.LoginServicio.Login(this.NombreUsuario, this.Clave).subscribe({

      next: (response) => {

        if (response?.data?.Token) {
          this.Router.navigate(['/menu']);
          this.Procesando = false;
        }

        this.isLoading = false;
      },

      error: (error) => {

        this.isLoading = false;

        const mensaje =
          error?.error?.error?.message ||
          error?.error?.message ||
          'Usuario o contraseña incorrectos';

        this.alertaServicio.MostrarError({ error: { message: mensaje } });
        this.errorMessage = mensaje;
        this.Procesando = false;

      }

    });

  }

  EsLogin(): boolean {
    return this.Router.url === '/login';
  }
}