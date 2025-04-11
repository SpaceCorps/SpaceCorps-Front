import { Component, output } from '@angular/core';
import { UserCredentialsLoginRequest } from '../../models/auth/UserCredentialsLoginRequest';

@Component({
  selector: 'app-login-as-admin-btn',
  imports: [],
  templateUrl: './login-as-admin-btn.component.html',
  styleUrl: './login-as-admin-btn.component.scss',
})
export class LoginAsAdminBtnComponent {
  toggleLoginEvent = output<UserCredentialsLoginRequest>();

  loginAsPredefinedAdmin() {
    const userCredentialsLoginRequest: UserCredentialsLoginRequest = {
      email: 'tester@tester.com',
      password: 'MegaGoodPassword123!',
    };

    this.toggleLoginEvent.emit(userCredentialsLoginRequest);
  }
}
