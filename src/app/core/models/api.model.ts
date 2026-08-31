/** Espelho de ErrorResponse — os três serviços usam o mesmo GlobalExceptionHandler. */
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
