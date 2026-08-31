/** Mesmo formato do user-monolith — user-service devolve o mesmo UserResponseDTO. */
export type Role = 'USER' | 'ADMIN';

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  role: Role;
}

/** Espelho de TokenResponseDTO — igual nos dois projetos. */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}
