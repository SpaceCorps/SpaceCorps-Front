import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { AuthState } from '../models/auth/AuthState';
import { UserCredentialsCreateRequest } from '../models/auth/UserCredentialsCreateRequest';
import { ApiService } from './api.service';
import { UserCredentialsLoginRequest } from '../models/auth/UserCredentialsLoginRequest';
import { GetPlayerInfoRequest } from '../models/player/GetPlayerInfoRequest';
import { SessionService } from './session.service';
import { tap } from 'rxjs';
import { PlayerData } from '../models/player/PlayerData';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ComponentStore<AuthState> {
  apiService = inject(ApiService);
  sessionService = inject(SessionService);
  stateService = inject(StateService);

  constructor() {
    super(new AuthState());
    this.initializeSession();
  }

  readonly authState$ = this.select((state) => state);

  initializeSession() {
    console.log('Initializing session...');
    const session = this.sessionService.getSession();
    console.log('Retrieved session:', session);
    if (session) {
      this.fetchUserAfterSuccessfulLogin(session);
    }
  }

  logIn(userCredentialsLoginRequest: UserCredentialsLoginRequest) {
    console.log('Attempting login...');
    return this.apiService.logIn(userCredentialsLoginRequest).pipe(
      tap((response) => {
        console.log('Login successful, setting session:', response);
        this.sessionService.setSession(response);
        this.fetchUserAfterSuccessfulLogin(response);
      })
    );
  }

  logOut() {
    this.sessionService.clearSession();
    this.patchState(new AuthState());
    this.stateService.clearPlayerState();
  }

  register(userCredentialsCreateRequest: UserCredentialsCreateRequest) {
    return this.apiService.createNewUser(userCredentialsCreateRequest).pipe(
      tap((response) => {
        this.sessionService.setSession(response);
        this.fetchUserAfterSuccessfulLogin(response);
      })
    );
  }

  fetchUserAfterSuccessfulLogin(request: PlayerData) {
    console.log('Fetching user after successful login:', request);
    const getPlayerInfoRequest: GetPlayerInfoRequest = {
      username: request.username,
    };
    this.apiService.getPlayerInfo(getPlayerInfoRequest).subscribe({
      next: (response) => {
        console.log('Player info fetched:', response);
        this.patchState({
          isLoggedIn: true,
          username: response.username,
        });
        // Update state service with player data
        this.stateService.updatePlayerData(response);
        console.log('Updated auth state:', this.state());
      },
      error: (err) => {
        console.error('Error fetching player info:', err);
        throw err;
      },
    });
  }

  getPlayerData() {
    return this.stateService.currentPlayer();
  }
}
