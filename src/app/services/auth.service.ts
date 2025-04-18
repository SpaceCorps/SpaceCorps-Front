import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { UserCredentialsCreateRequest } from '../models/auth/UserCredentialsCreateRequest';
import { UserCredentialsLoginRequest } from '../models/auth/UserCredentialsLoginRequest';
import { SessionService } from './session.service';
import { PlayerData } from '../models/player/PlayerData';
import { AuthState } from '../models/auth/AuthState';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_KEY = 'auth_state';
  private _authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    sessionId: null,
    username: null,
    userId: null,
    roles: [],
  });

  public readonly authState$ = this._authState.asObservable();
  private currentState = signal<AuthState>(this._authState.value);

  constructor(
    private apiService: ApiService,
    private sessionService: SessionService
  ) {
    this.loadAuthState();
  }

  private loadAuthState(): void {
    const savedState = localStorage.getItem(this.AUTH_KEY);
    if (savedState) {
      const state = JSON.parse(savedState);
      this._authState.next(state);
      this.currentState.set(state);
    }
  }

  private saveAuthState(state: AuthState): void {
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(state));
    this._authState.next(state);
    this.currentState.set(state);
  }

  public logIn(credentials: UserCredentialsLoginRequest): Observable<PlayerData> {
    return this.apiService.logIn(credentials).pipe(
      tap((playerData: PlayerData) => {
        const session = {
          sessionId: playerData.id, // Using player ID as session ID
          username: playerData.username,
          userId: playerData.userId,
          roles: ['player']
        };
        this.sessionService.setSession(session);
        this.updateAuthState({
          isAuthenticated: true,
          sessionId: playerData.id,
          username: playerData.username,
          userId: playerData.userId,
          roles: ['player'],
        });
      })
    );
  }

  public isLoggedIn(): boolean {
    return this.currentState().isAuthenticated;
  }

  public getUsername(): string | null {
    return this.currentState().username;
  }

  public getUserId(): string | null {
    return this.currentState().userId;
  }

  public getRoles(): string[] {
    return this.currentState().roles;
  }

  public hasRole(role: string): boolean {
    return this.currentState().roles.includes(role);
  }

  public getSessionId(): string | null {
    return this.currentState().sessionId;
  }

  public updateAuthState(state: Partial<AuthState>): void {
    const newState = { ...this.currentState(), ...state };
    this.saveAuthState(newState);
  }

  public logOut(): void {
    localStorage.removeItem(this.AUTH_KEY);
    this.sessionService.clearSession();
    this._authState.next({
      isAuthenticated: false,
      sessionId: null,
      username: null,
      userId: null,
      roles: [],
    });
    this.currentState.set(this._authState.value);
  }

  public register(userCredentialsCreateRequest: UserCredentialsCreateRequest): Observable<PlayerData> {
    return this.apiService.createNewUser(userCredentialsCreateRequest).pipe(
      tap((playerData: PlayerData) => {
        const session = {
          sessionId: playerData.id, // Using player ID as session ID
          username: playerData.username,
          userId: playerData.userId,
          roles: ['player']
        };
        this.sessionService.setSession(session);
        this.updateAuthState({
          isAuthenticated: true,
          sessionId: playerData.id,
          username: playerData.username,
          userId: playerData.userId,
          roles: ['player'],
        });
      })
    );
  }

  public fetchUserAfterSuccessfulLogin(playerData: PlayerData): void {
    this.updateAuthState({
      isAuthenticated: true,
      sessionId: playerData.id,
      username: playerData.username,
      userId: playerData.userId,
      roles: ['player'],
    });
  }
}
