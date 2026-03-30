import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteServicio } from '../../../../Servicios/ClienteServicio';
import { AlertaServicio } from '../../../../Servicios/Alerta-Servicio';
import { SpinnerGlobalComponent } from '../../../../Componentes/spinner-global/spinner-global.component';

@Component({
  selector: 'app-gestion-cliente',
  imports: [FormsModule, CommonModule, SpinnerGlobalComponent],
  templateUrl: './gestion-cliente.component.html',
  styleUrl: './gestion-cliente.component.css'
})
export class GestionClienteComponent {
  @Input() EsModal: boolean = false;
  @Output() ClienteGuardado = new EventEmitter<any>();
  Procesando = false;
  MostrarPedido = true;
  MostrarProductos = false;


  CentrarVertical = true;
  Codigo: number | null = null;

  Cliente: any = {
    NIT: '',
    NombreCliente: '',
    Celular: '',
    Direccion: '',
    CodigoEmpresa: 0
  };

  constructor(
    private ClienteServicio: ClienteServicio,
    private Router: Router,
    private Route: ActivatedRoute,
    private alerta: AlertaServicio
  ) { }

  ngOnInit() {
    if (!this.EsModal) { // solo carga cliente si no es modal
      const codigo = this.Route.snapshot.paramMap.get('codigo');
      if (codigo) {
        this.Codigo = Number(codigo);
        this.CargarCliente();
      }
    }

  }

  CargarCliente() {
    this.Procesando = true;
    if (!this.Codigo) return;

    this.ClienteServicio.Obtener(this.Codigo).subscribe({
      next: (res: any) => {
        if (res.data) this.Cliente = res.data;
      },
      error: (err) => this.alerta.MostrarError(err, 'Error al cargar cliente'),
      complete: () => this.Procesando = false
    });
  }

  Guardar() {
    this.Procesando = true;
    this.Cliente.CodigoEmpresa = 1;

    const operacion = this.Codigo
      ? this.ClienteServicio.Editar(this.Codigo, this.Cliente)
      : this.ClienteServicio.Crear(this.Cliente);

    operacion.subscribe({
      next: (res: any) => {
        if (this.EsModal) {
          this.ClienteGuardado.emit(res.data); // avisar al padre
          this.Procesando = false;
          this.alerta.MostrarExito('Cliente guardado correctamente');
          return;
        }

        this.alerta.MostrarExito('Cliente guardado correctamente');
        this.IrARuta('/cliente');
      },
      error: (err) => {
        this.alerta.MostrarError(err, 'Error al guardar cliente');
        this.Procesando = false;
      },
      complete: () => {
        this.Procesando = false;
      }
    });
  }

  IrARuta(ruta: string) {
    this.Router.navigate([ruta]);
  }

}
