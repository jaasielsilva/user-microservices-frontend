/**
 * Mesma porta do user-monolith (8080) — mas aqui quem responde é o
 * api-gateway, não a aplicação direto. O frontend nunca sabe que tem
 * 3 serviços atrás; a URL é idêntica à do monólito de propósito.
 */
export const environment = {
  producao: false,
  apiUrl: 'http://localhost:8080',
};
