import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FileUpload } from '../../../../shared/components/file-upload/file-upload';
import { environment } from '../../../../../environments/environment';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmNewPassword = control.get('confirmNewPassword')?.value;
  return newPassword === confirmNewPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, FileUpload],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly user = this.authService.user;
  readonly avatarUploadUrl = `${environment.apiUrl}/auth/me/avatar`;

  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);

  readonly profileForm = this.fb.group({
    fullName: [this.user()?.fullName ?? '', Validators.required],
    phone: [this.user()?.phone ?? ''],
  });

  readonly passwordForm = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile.set(true);
    const { fullName, phone } = this.profileForm.getRawValue();

    this.authService.updateProfile(fullName!, phone!).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.notificationService.success('Profile updated.');
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to update profile.');
      },
    });
  }

  onAvatarUploaded(): void {
    this.notificationService.success('Avatar updated.');
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.savingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    this.authService.changePassword(currentPassword!, newPassword!).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.notificationService.success('Password changed.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.notificationService.error(err.error?.error?.message ?? 'Failed to change password.');
      },
    });
  }
}