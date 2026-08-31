import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ErrorResponse } from '../models/api.model';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Igual ao do user-monolith, com UM caso a mais: 503. É o auth-service
 * respondendo "não consegui falar com o user-service agora" — só
 * existe em arquitetura distribuída, não tem equivalente no monólito.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((erro: HttpErrorResponse) => {
      const corpo = erro.error as ErrorResponse | undefined;
      const mensagem = corpo?.message;
      const ehAuth = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

      if (erro.status === 401 && !ehAuth) {
        return auth.refresh().pipe(
          switchMap((usuario) => {
            if (!usuario) {
              auth.limparSessao();
              router.navigate(['/login']);
              return throwError(() => erro);
            }
            return next(
              req.clone({ setHeaders: { Authorization: `Bearer ${auth.accessToken}` } }),
            );
          }),
        );
      }

      if (ehAuth) {
        return throwError(() => erro);
      }

      switch (erro.status) {
        case 0:
          toast.erro('Sem conexão com o servidor. Verifique se o gateway está no ar.');
          break;
        case 403:
          toast.erro(mensagem ?? 'Você não tem permissão para esta ação.');
          break;
        case 404:
          toast.erro(mensagem ?? 'Registro não encontrado.');
          break;
        case 409:
          toast.aviso(mensagem ?? 'Operação não permitida.');
          break;
        case 400:
          toast.erro(mensagem ?? 'Verifique os campos informados.');
          break;
        case 503:
          // auth-service não conseguiu falar com o user-service — falha
          // parcial de sistema distribuído, não erro do usuário.
          toast.erro(mensagem ?? 'Serviço de usuários indisponível no momento. Tente novamente.');
          break;
        default:
          toast.erro(mensagem ?? 'Erro inesperado. Tente novamente.');
      }

      return throwError(() => erro);
    }),
  );
};
