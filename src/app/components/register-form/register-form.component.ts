import { Component, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { UserCredentialsCreateRequest } from '../../models/auth/UserCredentialsCreateRequest';

@Component({
  selector: 'app-register-form',
  imports: [ReactiveFormsModule, NgClass, NgIf],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss',
})
export class RegisterFormComponent {
  passwordMatchValidator: ValidatorFn = (control: AbstractControl) => {
    const form = control as FormGroup;
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  registerForm = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern('^[a-zA-Z0-9_]+$'),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$',
        ),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator },
  );

  toggleViewEvent = output<void>();
  toggleRegisterEvent = output<UserCredentialsCreateRequest>();

  get username() {
    return this.registerForm.get('username');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  toggleView() {
    this.toggleViewEvent.emit();
  }

  handleRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const userCredentialsCreateRequest: UserCredentialsCreateRequest = {
      username: this.registerForm.get('username')!.value!,
      email: this.registerForm.get('email')!.value!,
      password: this.registerForm.get('password')!.value!,
    };

    this.toggleRegisterEvent.emit(userCredentialsCreateRequest);
  }
}
