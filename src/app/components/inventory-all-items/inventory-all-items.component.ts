import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SellableItems } from '../../models/player/Items';
import {
  animate,
  animateChild,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const ORDERED_CATEGORIES = [
  'Ship',
  'Laser',
  'LaserAmp',
  'Shield',
  'ShieldCell',
  'Engine',
  'Thruster',
  'LaserAmmo',
];

@Component({
  selector: 'app-inventory-all-items',
  animations: [
    trigger('slideInFromLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100%)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateX(0%)' })
        ),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateX(0)' }),
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateX(-100%)' })
        ),
      ]),
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(-20px)' }),
            stagger(50, [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
        query(
          ':leave',
          [
            stagger(50, [
              animate(
                '300ms ease-in',
                style({ opacity: 0, transform: 'translateY(20px)' })
              ),
            ]),
          ],
          { optional: true }
        ),
        query('@*', animateChild(), { optional: true }),
      ]),
    ]),
  ],

  imports: [],
  templateUrl: './inventory-all-items.component.html',
  styleUrl: './inventory-all-items.component.scss',
})
export class InventoryAllItemsComponent implements OnInit, OnChanges {
  @Input({
    required: true,
  })
  items: SellableItems[] = [];

  @Output() itemSelected: EventEmitter<SellableItems> =
    new EventEmitter<SellableItems>();
  @Output() itemDragged: EventEmitter<SellableItems> =
    new EventEmitter<SellableItems>();

  categorizedItems = new Map<string, SellableItems[]>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const username = this.authService.state().username;

    if (!username) {
      console.error('Username was not provided, can not load component.');
      return;
    }

    if (this.items) {
      this.categorizeItems();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && !changes['items'].firstChange) {
      this.categorizeItems();
    }
  }

  categorizeItems() {
    // Start each category as an empty array, preserving order
    this.categorizedItems = new Map<string, SellableItems[]>(
      ORDERED_CATEGORIES.map((category) => [category, []])
    );

    // Place incoming items into their respective category arrays
    for (const item of this.items) {
      if (this.categorizedItems.has(item.itemType)) {
        this.categorizedItems.get(item.itemType)!.push(item);
      }
    }

    // Sort items within each category by name
    for (const [category, items] of this.categorizedItems.entries()) {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {}

  onDragStart(event: DragEvent, item: SellableItems) {
    event.dataTransfer?.setData('text/plain', JSON.stringify(item));
    this.itemDragged.emit(item);
  }
}
