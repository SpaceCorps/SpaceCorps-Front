import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor() {}

  private sessionKey = 'userSession';

  setSession(data: any): void {
    sessionStorage.setItem(this.sessionKey, JSON.stringify(data));
  }

  getSession(): any {
    const sessionData = sessionStorage.getItem(this.sessionKey);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  clearSession(): void {
    sessionStorage.removeItem(this.sessionKey);
  }
}
