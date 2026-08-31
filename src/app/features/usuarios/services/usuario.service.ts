import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Usuario, UsuarioEditar } from '../models/usuario.model';

/**
 * Sem método criar() de propósito: criar usuário é fluxo de
 * REGISTRO (AuthService.registrar), não um CRUD direto no
 * user-service — ver o comentário em usuario.model.ts.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/users`;

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }

  buscar(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.url}/${id}`);
  }

  atualizar(id: number, dados: UsuarioEditar): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, dados);
  }

  /**
   * Exclui só o PERFIL (user-service) — a credencial correspondente
   * continua existindo no auth_db. Ou seja: a pessoa some da listagem,
   * mas ainda consegue fazer login (só não vai mais achar o próprio
   * perfil depois). É uma inconsistência real da arquitetura de
   * referência: excluir usuário de verdade precisaria de uma chamada
   * também pro auth-service (ou um evento assíncrono avisando os dois
   * lados) — não implementado neste laboratório.
   */
  excluir(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }
}
