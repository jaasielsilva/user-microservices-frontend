import { Role } from '../../../core/models/sessao.model';

/** Espelho de UserResponseDTO do user-service. */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/**
 * Espelho de UserRequestDTO do user-service — SEM senha, porque este
 * serviço não guarda credencial nenhuma. Criar usuário (que envolve
 * senha) é um fluxo diferente, feito pelo AuthService.registrar().
 */
export interface UsuarioEditar {
  nome: string;
  email: string;
  role: Role;
}
