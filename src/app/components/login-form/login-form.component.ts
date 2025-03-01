import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { UserCredentialsLoginRequest } from '../../models/auth/UserCredentialsLoginRequest';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  loginForm = new FormGroup({
    login: new FormControl(''),
    password: new FormControl(''),
  });

  toggleViewEvent = output<void>();
  toggleLoginEvent = output<UserCredentialsLoginRequest>();

  toggleView() {
    this.toggleViewEvent.emit();
  }

  handleLogin() {
    let userCredentialsLoginRequest: UserCredentialsLoginRequest;
    userCredentialsLoginRequest = {
      email: this.loginForm.get('login')!.value!,
      password: this.loginForm.get('password')!.value!,
    };

    if (!this.loginForm.get('login')!.value!.includes('@')) {
      userCredentialsLoginRequest = {
        username: this.loginForm.get('login')!.value!,
        password: this.loginForm.get('password')!.value!,
      };
    }
    this.toggleLoginEvent.emit(userCredentialsLoginRequest);
  }
}

