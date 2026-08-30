import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly loading = signal(false);
  readonly registeredAs = signal<string | null>(null);

readonly form = this.fb.group(
  {
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  },
  { validators: passwordsMatchValidator },
);


togglePassword(): void {
  this.showPassword.update((v) => !v);
}

toggleConfirmPassword(): void {
  this.showConfirmPassword.update((v) => !v);
}
submit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading.set(true);

  const { fullName, email, password, phone } = this.form.getRawValue();

  this.authService.register(fullName!, email!, password!, phone || undefined).subscribe({
  next: (res) => {
    this.loading.set(false);
    this.registeredAs.set(res.user.fullName);
    this.notificationService.success('Account created successfully.');
  },
  error: (err) => {
    this.loading.set(false);
    this.notificationService.error(err.error?.error?.message ?? 'Something went wrong. Please try again.');
  },
  });
}
}