import { Component, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayerData } from '../models/player/PlayerData';
import { ApiService } from '../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Inventory } from '../models/player/Inventory';
import { StateService } from '../services/state.service';

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

  constructor(
    private apiService: ApiService,
    private stateService: StateService
  ) {
    // Set up effect to watch inventory changes
    effect(() => {
      const currentInventory = this.stateService.currentInventory();
      if (currentInventory) {
        this.selectedUserInventory = currentInventory;
      }
    });
  }

  ngOnInit() {
    this.apiService.getAllPlayers().subscribe({
      next: (response) => {
        this.users = response;
      },
      error: (error: HttpErrorResponse) => {
        this.commandHistory.unshift(
          `${this.getCurrentTime()} Error fetching users: ${error.message}`
        );
      },
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }

  executeCommand() {
    if (!this.command.trim()) return;

    this.commandHistory.unshift(
      `${this.getCurrentTime()} Executing command: ${this.command}`
    );

    this.apiService.handleUserEditorCommand(this.command).subscribe({
      next: () => {
        this.commandHistory.unshift(
          `${this.getCurrentTime()} Command executed successfully`
        );
        this.command = '';
      },
      error: (error: HttpErrorResponse) => {
        this.commandHistory.unshift(
          `${this.getCurrentTime()} Error executing command: ${error.message}`
        );
      },
    });
  }

  onUserClick(username: string) {
    this.stateService.fetchPlayerInventory(username);
  }
}
