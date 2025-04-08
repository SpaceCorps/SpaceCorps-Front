import { Component, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { UserCredentialsLoginRequest } from '../../models/auth/UserCredentialsLoginRequest';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, NgClass, NgIf],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  loginForm = new FormGroup({
    login: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  toggleViewEvent = output<void>();
  toggleLoginEvent = output<UserCredentialsLoginRequest>();

  get login() {
    return this.loginForm.get('login');
  }
  get password() {
    return this.loginForm.get('password');
  }

  toggleView() {
    this.toggleViewEvent.emit();
  }

  handleLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginValue = this.loginForm.get('login')!.value!;
    const isEmail = loginValue.includes('@');

    const userCredentialsLoginRequest: UserCredentialsLoginRequest = {
      [isEmail ? 'email' : 'username']: loginValue,
      password: this.loginForm.get('password')!.value!,
    };

    this.toggleLoginEvent.emit(userCredentialsLoginRequest);
  }
}
