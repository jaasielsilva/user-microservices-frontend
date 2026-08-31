import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmacaoComponent } from './shared/confirmacao/confirmacao.component';
import { ToastComponent } from './shared/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, ConfirmacaoComponent],
  template: `
    <router-outlet />
    <app-toasts />
    <app-confirmacao />
  `,
})
export class App {}
