import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Role } from '../../../core/models/sessao.model';
import { ToastService } from '../../../core/services/toast.service';
import { UsuarioEditar } from '../models/usuario.model';
import { UsuarioService } from '../services/usuario.service';

/**
 * Só edição — sem campo de senha (o user-service não guarda
 * credencial nenhuma, então nem faz sentido pedir). Isso resolve, de
 * quebra, o incômodo que existia no formulário equivalente do
 * user-monolith (lá a senha era obrigatória mesmo editando só o nome).
 */
@Component({
  selector: 'app-usuarios-editar',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="barra-topo">
      <h1>Editar usuário</h1>
      <a class="btn btn-secundario" routerLink="/usuarios">Voltar</a>
    </div>

    <form class="card" style="max-width: 480px" [formGroup]="form" (ngSubmit)="salvar()">
      <label class="campo">
        <span>Nome *</span>
        <input formControlName="nome" [class.invalido]="invalido('nome')" />
        @if (invalido('nome')) {
          <span class="erro-campo">Nome deve ter entre 2 e 150 caracteres.</span>
        }
      </label>

      <label class="campo">
        <span>E-mail *</span>
        <input type="email" formControlName="email" [class.invalido]="invalido('email')" />
        @if (invalido('email')) {
          <span class="erro-campo">E-mail inválido.</span>
        }
      </label>

      <label class="campo">
        <span>Role *</span>
        <select formControlName="role">
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </label>

      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px">
        <a class="btn btn-secundario" routerLink="/usuarios">Cancelar</a>
        <button type="submit" class="btn" [disabled]="salvando()">
          {{ salvando() ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  `,
})
export class UsuariosEditarPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  private readonly id = Number(this.rota.snapshot.paramMap.get('id'));

  protected readonly salvando = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    role: ['USER' as Role, [Validators.required]],
  });

  constructor() {
    this.service.buscar(this.id).subscribe((dados) =>
      this.form.patchValue({ nome: dados.nome, email: dados.email, role: dados.role }),
    );
  }

  protected invalido(campo: 'nome' | 'email'): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && controle.touched;
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dados: UsuarioEditar = this.form.getRawValue();

    this.salvando.set(true);
    this.service.atualizar(this.id, dados).subscribe({
      next: () => {
        this.toast.sucesso('Alterações salvas.');
        this.router.navigate(['/usuarios']);
      },
      error: () => {
        this.salvando.set(false);
      },
    });
  }
}
