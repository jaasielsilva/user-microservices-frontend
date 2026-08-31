import { Role } from '../models/sessao.model';

export interface ItemDeMenu {
  rota: string;
  titulo: string;
  icone: string;
  roles?: Role[];
}

export const MENU: ItemDeMenu[] = [{ rota: '/usuarios', titulo: 'Usuários', icone: '●' }];

export function itensVisiveis(itens: ItemDeMenu[], role: Role | null): ItemDeMenu[] {
  return itens.filter((item) => !item.roles || (role != null && item.roles.includes(role)));
}
