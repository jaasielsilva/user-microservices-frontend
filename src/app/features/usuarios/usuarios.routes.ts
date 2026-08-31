import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/auth.guard';

/** Sem rota 'novo' — criar usuário é /criar-conta (fluxo de registro). */
export const rotas: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/usuarios-lista.page').then((m) => m.UsuariosListaPage),
  },
  {
    path: ':id',
    canActivate: [roleGuard('ADMIN')],
    loadComponent: () =>
      import('./pages/usuarios-editar.page').then((m) => m.UsuariosEditarPage),
  },
];
