import { Component, inject } from '@angular/core';
import { LoginFormComponent } from '../components/login-form/login-form.component';
import { RegisterFormComponent } from '../components/register-form/register-form.component';
import { AuthService } from '../services/auth.service';
import { UserCredentialsCreateRequest } from '../models/auth/UserCredentialsCreateRequest';
import { HttpErrorResponse } from '@angular/common/http';
import { UserCredentialsLoginRequest } from '../models/auth/UserCredentialsLoginRequest';
import { Router } from '@angular/router';
import { LoginAsAdminBtnComponent } from "../components/login-as-admin-btn/login-as-admin-btn.component";
import { ErrorModalComponent } from "../components/error-modal/error-modal.component";

@Component({
  selector: 'app-login',
  imports: [
    LoginFormComponent,
    RegisterFormComponent,
    LoginAsAdminBtnComponent,
    ErrorModalComponent
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  authService = inject(AuthService);
  isLoginView = true;
  error: HttpErrorResponse | null = null;
  isLoading = false;
  router = inject(Router);

  clearLoginError() {
    this.error = null;
  }

  onToggleView() {
    this.isLoginView = !this.isLoginView;
    this.clearLoginError();
  }

  onRegister($event: UserCredentialsCreateRequest) {
    const result = this.authService.register($event);
    result.subscribe({
      next: (response) => {
        this.onToggleView();
      },
      error: (err: HttpErrorResponse) => {
        this.error = err;
        console.log(err);
      }
    });
  }

  onLogin($event: UserCredentialsLoginRequest) {
    if (this.isLoading) return;
    this.isLoading = true;
    const result = this.authService.logIn($event);
    result.subscribe({
      next: (response) => {
        this.isLoading = false;
        this.clearLoginError();
        try {
          this.authService.fetchUserAfterSuccessfulLogin(response)
          void this.router.navigate(['lobby']);
        } catch (err) {
          this.error = err as HttpErrorResponse;
          console.log(err);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.error = err;
        console.log(err);
      }
    });
  }
}
