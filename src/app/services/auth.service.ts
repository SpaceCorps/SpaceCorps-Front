import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { AuthState } from '../models/auth/AuthState';
import { UserCredentialsCreateRequest } from '../models/auth/UserCredentialsCreateRequest';
import { ApiService } from './api.service';
import { UserCredentialsLoginRequest } from '../models/auth/UserCredentialsLoginRequest';
import { GetPlayerInfoRequest } from '../models/player/GetPlayerInfoRequest';
import { SessionService } from './session.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ComponentStore<AuthState> {
  apiService = inject(ApiService);
  sessionService = inject(SessionService);

  constructor() {
    super(new AuthState());
    this.initializeSession();
  }

  readonly authState$ = this.select((state) => state);

  initializeSession() {
    const session = this.sessionService.getSession();
    if (session) {
      this.fetchUserAfterSuccessfulLogin(session);
    }
  }

  logIn(userCredentialsLoginRequest: UserCredentialsLoginRequest) {
    return this.apiService.logIn(userCredentialsLoginRequest).pipe(
      tap((response) => {
        this.sessionService.setSession(response);
        this.fetchUserAfterSuccessfulLogin(response);
      })
    );
  }

  logOut() {
    this.sessionService.clearSession();
    this.patchState(new AuthState());
  }

  register(userCredentialsCreateRequest: UserCredentialsCreateRequest) {
    return this.apiService.createNewUser(userCredentialsCreateRequest).pipe(
      tap((response) => {
        this.sessionService.setSession(response);
        this.fetchUserAfterSuccessfulLogin(response);
      })
    );
  }

  fetchUserAfterSuccessfulLogin(response: any) {
    const getPlayerInfoRequest: GetPlayerInfoRequest = {
      username: response.username,
    };
    this.apiService.getPlayerInfo(getPlayerInfoRequest).subscribe({
      next: (response) => {
        this.patchState({
          isLoggedIn: true,
          username: response.username,
          playerData: response,
        });
        console.log(this.state());
      },
      error: (err) => {
        throw err;
      },
    });
  }

  getPlayerData() {
    return this.state().playerData;
  }
}
