import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayerData } from '../models/player/PlayerData';
import { ApiService } from '../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Inventory } from '../models/player/Inventory';

@Component({
  selector: 'app-users-editor',
  templateUrl: './users-editor.component.html',
  styleUrls: ['./users-editor.component.scss'],
  imports: [FormsModule],
})
export class UsersEditorComponent implements OnInit {
  users: PlayerData[] | null = null;
  selectedUserInventory: Inventory | null = null;

  command: string = '';
  commandHistory: string[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  private fetchUsers() {
    this.apiService.getAllPlayers().subscribe({
      next: (data: PlayerData[]) => {
        this.users = data;
      },
      error: (error: HttpErrorResponse) => {
        this.users = null;
        this.commandHistory.unshift(`Error fetching users: ${error.message}`);
      },
    });
  }

  private getCurrentTime(): string {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
  }

  executeCommand() {
    const timestamp = this.getCurrentTime();

    this.commandHistory.unshift(`${timestamp} ${this.command}`);

    if (this.commandHistory.length > 10) {
      this.commandHistory.pop();
    }

    const commandParts = this.command.split(' ');

    if (
      commandParts.length === 5 &&
      commandParts[0] === 'user' &&
      commandParts[2] === 'set'
    ) {
      const username = commandParts[1];
      const resource = commandParts[3];
      const amount = parseInt(commandParts[4], 10);

      if (!isNaN(amount)) {
        this.apiService.handleUserEditorCommand(this.command).subscribe({
          next: () => {
            this.commandHistory.unshift(
              `${timestamp} Successfully set ${resource} for ${username} to ${amount}`
            );
          },
          error: (error: HttpErrorResponse) => {
            this.commandHistory.unshift(
              `${timestamp} Error setting ${resource} for ${username}: ${JSON.stringify(error)}`
            );
          },
        });
      } else {
        this.commandHistory.unshift(
          `${timestamp} Invalid amount: ${commandParts[4]}`
        );
      }
    } else {
      this.commandHistory.unshift(
        `${timestamp} Invalid command: ${this.command}`
      );
    }

    this.command = '';

    setTimeout(() => {
      this.fetchUsers();
    }, 300);
  }

  onUserClick(username: string) {
    this.apiService.getUserInventory(username).subscribe({
      next: (response) => {
        this.selectedUserInventory = response;
      },
      error: (error: HttpErrorResponse) => {
        this.commandHistory.unshift(
          `${this.getCurrentTime()} Error fetching inventory for ${username}: ${error.message}`
        );
      },
    });
  }
}
