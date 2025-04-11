import { Component } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { HomeDragupComponent } from '../components/home-dragup/home-dragup.component';

@Component({
  selector: 'app-home',
  imports: [LoginComponent, HomeDragupComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
