import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerGlobalService {

  private spinner = new BehaviorSubject<boolean>(false);
  spinner$ = this.spinner.asObservable();

  mostrar() {
    this.spinner.next(true);
  }

  ocultar() {
    this.spinner.next(false);
  }

}