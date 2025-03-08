import {Component} from '@angular/core';
import {LoginComponent} from '../login/login.component';
import {HomeCarouselComponent} from '../components/home-carousel/home-carousel.component';
import {HomeDragupComponent} from '../components/home-dragup/home-dragup.component';

@Component({
  selector: 'app-home',
  imports: [
    LoginComponent,
    HomeCarouselComponent,
    HomeDragupComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
