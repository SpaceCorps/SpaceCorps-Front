import { Injectable } from '@angular/core';
import * as SignalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class HubService {
  private hubConnection?: SignalR.HubConnection;

  async initializeSignalR(username: string) {
    console.log(username);
    this.hubConnection = new SignalR.HubConnectionBuilder()
      .withUrl(
        `http://localhost:5274/gameHub?username=${encodeURIComponent(username)}`
      )
      .build();

    await this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch((err) =>
        console.error('Error while starting SignalR connection: ' + err)
      )
      .then(() => {
        this.send('requestLogin', { username: username });
      });

    this.hubConnection.onclose(async () => {
      console.error('SignalR connection closed unexpectedly.');
    });
  }

  public on<T = unknown>(
    event: string,
    callback: (...args: T[]) => void
  ): void {
    this.hubConnection?.on(event, callback);
  }

  public off<T = unknown>(
    event: string,
    callback: (...args: T[]) => void
  ): void {
    this.hubConnection?.off(event, callback);
  }

  public async send<T extends keyof ServerRequestTypes>(
    event: T,
    args: ServerRequestTypes[T]
  ): Promise<void> {
    console.log('Sending SignalR message: ' + event, args ? args : '');

    if (!this.hubConnection) {
      console.error('SignalR connection is not initialized');
      return Promise.reject('SignalR connection is not initialized');
    }

    try {
      if (args === null) {
        return await this.hubConnection.invoke(event);
      } else {
        return await this.hubConnection.invoke(event, args);
      }
    } catch (err) {
      console.error('Error while sending SignalR message: ' + err);
      throw err;
    }
  }
}

type ServerRequestTypes = {
  requestLogin: RequestLogin;
  logEntities: null;
  requestMove: {
    username: string;
    position: {
      x: number;
      y: number;
      z: number;
    };
  };
  requestTeleport: {
    destinationMap: string;
  };
};

type RequestLogin = {
  username: string;
};
