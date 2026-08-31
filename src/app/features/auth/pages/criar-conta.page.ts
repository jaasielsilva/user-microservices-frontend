import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Só existe aqui, nos microsserviços — o auth-service tem um endpoint
 * público de registro que orquestra a criação do perfil (chamando o
 * user-service) E da credencial no mesmo fluxo. O user-monolith não
 * tem esse endpoint: lá só ADMIN cria usuário, via CRUD.
 */
@Component({
  selector: 'app-criar-conta',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="tela-auth">
      <div>
        <div class="marca">User Microservices</div>
        <form class="card caixa" [formGroup]="form" (ngSubmit)="criar()">
          <h2>Criar conta</h2>

          <label class="campo">
            <span>Nome</span>
            <input formControlName="nome" [class.invalido]="invalido('nome')" />
            @if (invalido('nome')) {
              <span class="erro-campo">Informe seu nome.</span>
            }
          </label>

          <label class="campo">
            <span>E-mail</span>
            <input
              type="email"
              formControlName="email"
              autocomplete="username"
              [class.invalido]="invalido('email')"
            />
            @if (invalido('email')) {
              <span class="erro-campo">Informe um e-mail válido.</span>
            }
          </label>

          <label class="campo">
            <span>Senha</span>
            <input
              type="password"
              formControlName="senha"
              autocomplete="new-password"
              [class.invalido]="invalido('senha')"
            />
            @if (invalido('senha')) {
              <span class="erro-campo">Mínimo de 6 caracteres.</span>
            }
          </label>

          @if (erro()) {
            <p class="erro-campo">{{ erro() }}</p>
          }

          <button type="submit" class="btn" style="width: 100%" [disabled]="enviando()">
            {{ enviando() ? 'Criando...' : 'Criar conta' }}
          </button>

          <p class="rodape texto-suave">
            Já tem conta? <a routerLink="/login">Entrar</a>
          </p>
        </form>
      </div>
    </div>
  `,
})
export class CriarContaPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected invalido(campo: 'nome' | 'email' | 'senha'): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && controle.touched;
  }

  protected criar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);

    this.auth.registrar(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/usuarios'),
      error: (e) => {
        this.enviando.set(false);
        this.erro.set(e.error?.message ?? 'Não foi possível criar a conta. Tente novamente.');
      },
    });
  }
}
