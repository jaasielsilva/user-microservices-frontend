import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, of, shareReplay, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, Role, UsuarioLogado } from '../models/sessao.model';

const CHAVE_REFRESH_TOKEN = 'user-microservices.refreshToken';

/**
 * Mesma estrutura do AuthService do user-monolith (mesmas limitações:
 * refresh token em localStorage, sem /me, sem /auth/logout). A
 * diferença real é o register() — aqui SIM existe um endpoint público
 * de auto-cadastro, porque é o auth-service quem orquestra a criação
 * do perfil (via user-service) e da credencial, no mesmo fluxo que já
 * testamos no backend (com compensação em caso de falha parcial).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  private token: string | null = null;
  private refreshEmAndamento?: Observable<UsuarioLogado | null>;

  readonly usuario = signal<UsuarioLogado | null>(null);
  readonly autenticado = computed(() => this.usuario() !== null);

  get accessToken(): string | null {
    return this.token;
  }

  temRole(...roles: Role[]): boolean {
    const role = this.usuario()?.role;
    return role != null && roles.includes(role);
  }

  login(email: string, senha: string): Observable<UsuarioLogado> {
    return this.http.post<LoginResponse>(`${this.api}/auth/login`, { email, senha }).pipe(
      tap((dados) => this.aplicarTokens(dados)),
      switchMap(() => this.carregarPerfil(email)),
      tap((usuario) => this.usuario.set(usuario)),
    );
  }

  /** Espelho de RegisterRequestDTO no auth-service. */
  registrar(dados: { nome: string; email: string; senha: string }): Observable<UsuarioLogado> {
    return this.http
      .post<UsuarioLogado>(`${this.api}/auth/register`, dados)
      .pipe(switchMap(() => this.login(dados.email, dados.senha)));
  }

  logout(): void {
    this.limparSessao();
  }

  refresh(): Observable<UsuarioLogado | null> {
    if (!this.refreshEmAndamento) {
      const refreshToken = localStorage.getItem(CHAVE_REFRESH_TOKEN);
      if (!refreshToken) {
        return of(null);
      }

      this.refreshEmAndamento = this.http
        .post<LoginResponse>(`${this.api}/auth/refresh`, { refreshToken })
        .pipe(
          tap((dados) => this.aplicarTokens(dados)),
          switchMap((dados) => this.carregarPerfil(this.extrairEmail(dados.accessToken))),
          tap((usuario) => this.usuario.set(usuario)),
          catchError(() => {
            this.limparSessao();
            return of(null);
          }),
          finalize(() => (this.refreshEmAndamento = undefined)),
          shareReplay(1),
        );
    }
    return this.refreshEmAndamento;
  }

  restaurarSessao(): Observable<unknown> {
    return this.refresh();
  }

  limparSessao(): void {
    this.token = null;
    this.usuario.set(null);
    localStorage.removeItem(CHAVE_REFRESH_TOKEN);
  }

  private carregarPerfil(email: string): Observable<UsuarioLogado> {
    return this.http.get<UsuarioLogado>(`${this.api}/users/email/${encodeURIComponent(email)}`);
  }

  private aplicarTokens(dados: LoginResponse): void {
    this.token = dados.accessToken;
    localStorage.setItem(CHAVE_REFRESH_TOKEN, dados.refreshToken);
  }

  private extrairEmail(accessToken: string): string {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    return payload.sub as string;
  }
}
