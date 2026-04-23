import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LoginServicio } from '../Servicios/LoginServicio';
import { AlertaServicio } from '../Servicios/Alerta-Servicio';

@Injectable({
  providedIn: 'root'
})
export class AutorizacionRuta implements CanActivate {

  constructor(private LoginServicio: LoginServicio, private router: Router, private alerta: AlertaServicio) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {

    try {

      const tokenValido = this.LoginServicio.ValidarToken();

      // ❌ TOKEN INVÁLIDO (controlado)
      if (!tokenValido) {
        this.LoginServicio.EliminarToken();

        this.alerta.MostrarAlerta(
          'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
        );

        this.router.navigate(['/login']);
        return false;
      }

      const payload = this.LoginServicio.ObtenerPayloadToken();
      const rol = this.LoginServicio.ObtenerRol();
      const superAdmin = payload?.SuperAdmin;

      const rolesPermitidos = next.data?.['roles'] as string[];

      // 🔥 SUPERADMIN → acceso total
      if (superAdmin === 1) {
        return true;
      }

      // ✔️ Sin restricción
      if (!rolesPermitidos || rolesPermitidos.length === 0) {
        return true;
      }

      // ✔️ Rol válido
      if (rolesPermitidos.includes(rol!)) {
        return true;
      }

      // ⚠️ ACCESO DENEGADO (controlado)
      this.alerta.MostrarAlerta(
        'No tienes permisos para acceder a esta sección.'
      );

      // Redirección inteligente
      if (rol === 'EMPRESA_ASOCIADA') {
        this.router.navigate(['/menu-asociada']);
      } else if (rol === 'EMPRESA_OFICIAL') {
        this.router.navigate(['/menu']);
      } else {
        this.router.navigate(['/login']);
      }

      return false;

    } catch (error) {

      // ❌ ERROR NO CONTROLADO
      this.alerta.MostrarError(error);

      this.router.navigate(['/login']);
      return false;
    }
  }

}
