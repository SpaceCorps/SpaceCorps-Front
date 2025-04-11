import { Component, Input } from '@angular/core';
import { ShipModelComponent } from '../ship-model/ship-model.component';

@Component({
  selector: 'app-inventory-active-ship',
  imports: [ShipModelComponent],
  templateUrl: './inventory-active-ship.component.html',
  styleUrl: './inventory-active-ship.component.scss',
})
export class InventoryActiveShipComponent {
  @Input({
    required: true,
  })
  activeShipItemName?: string;
}
