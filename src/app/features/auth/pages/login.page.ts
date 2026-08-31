import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="tela-auth">
      <div>
        <div class="marca">User Microservices</div>
        <form class="card caixa" [formGroup]="form" (ngSubmit)="entrar()">
          <h2>Entrar</h2>

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
              autocomplete="current-password"
              [class.invalido]="invalido('senha')"
            />
            @if (invalido('senha')) {
              <span class="erro-campo">Informe sua senha.</span>
            }
          </label>

          @if (erro()) {
            <p class="erro-campo">{{ erro() }}</p>
          }

          <button type="submit" class="btn" style="width: 100%" [disabled]="enviando()">
            {{ enviando() ? 'Entrando...' : 'Entrar' }}
          </button>

          <p class="rodape texto-suave">
            Ainda não tem conta? <a routerLink="/criar-conta">Criar conta</a>
          </p>
        </form>
      </div>
    </div>
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);

  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  protected invalido(campo: 'email' | 'senha'): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && controle.touched;
  }

  protected entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);
    const { email, senha } = this.form.getRawValue();

    this.auth.login(email, senha).subscribe({
      next: () => {
        const destino = this.rota.snapshot.queryParamMap.get('returnUrl') ?? '/usuarios';
        this.router.navigateByUrl(destino);
      },
      error: (e) => {
        this.enviando.set(false);
        this.erro.set(e.error?.message ?? 'Não foi possível entrar. Tente novamente.');
      },
    });
  }
}
