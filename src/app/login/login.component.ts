import { Component, inject } from '@angular/core';
import { LoginFormComponent } from '../components/login-form/login-form.component';
import { RegisterFormComponent } from '../components/register-form/register-form.component';
import { AuthService } from '../services/auth.service';
import { UserCredentialsCreateRequest } from '../models/auth/UserCredentialsCreateRequest';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorModalComponent } from '../components/error-modal/error-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    LoginFormComponent,
    RegisterFormComponent,
    ErrorModalComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  authService = inject(AuthService);
  isLoginView = true;
  error: HttpErrorResponse | null = null;

  onToggleView () {
    this.isLoginView = !this.isLoginView;
    this.clearLoginError();
  }

  onRegister ($event: UserCredentialsCreateRequest) {
    const result = this.authService.register($event);
    result.subscribe({
      next: (response) => {
        this.clearLoginError();
        console.log(response);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err;
        console.log(err);
      }
    });
  }

  clearLoginError () {
    this.error = null;
  }
}
