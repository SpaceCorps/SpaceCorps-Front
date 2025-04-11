import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { SpaceMapDataEntry } from '../models/dataEntries/SpaceMapDataEntry';
import { UpdateSpaceMapDataEntryRequest } from '../models/dataEntries/UpdateSpaceMapDataEntryRequest';
import { ErrorModalComponent } from '../components/error-modal/error-modal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons/faArrowsRotate';
import { StaticEntity } from '../models/entity/StaticEntity';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateStaticEntityRequest } from '../models/entity/CreateStaticEntityRequest';
import { SpawnableAlien } from '../models/entity/SpawnableAlien';

@Component({
  selector: 'app-spacemap-editor',
  imports: [FormsModule, FontAwesomeModule, NgClass, ErrorModalComponent],
  templateUrl: './spacemap-editor.component.html',
  styleUrl: './spacemap-editor.component.scss',
})
export class SpacemapEditorComponent {
  spaceMapDataEntryNames: string[] = [];
  selectedSpaceMapDataEntry: SpaceMapDataEntry | null = null;
  selectedSpaceMapDataEntryName: string | null = null;
  newSpaceMapName: string | null = null;
  error: HttpErrorResponse | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.fetchSpaceMapDataEntryNames();
  }

  fetchSpaceMapDataEntryNames() {
    this.apiService.getSpaceMapDataEntryNames().subscribe((data: string[]) => {
      this.spaceMapDataEntryNames = data;
    });
  }

  selectSpaceMapDataEntry(name: string) {
    this.selectedSpaceMapDataEntryName = name;
    this.apiService.getSpaceMapDataEntry(name).subscribe({
      next: (data: SpaceMapDataEntry) => {
        this.selectedSpaceMapDataEntry = data;
        this.updateUrlWithMapName(name);
        console.log('Fetched SpaceMapDataEntry: ', data);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err;
        console.log(err);
      },
    });
  }

  postSpaceMapDataEntryByName(newName: string) {
    this.apiService.postSpaceMapDataEntry(newName).subscribe({
      next: () => {
        this.fetchSpaceMapDataEntryNames();
        this.newSpaceMapName = null;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err;
        console.log(err);
      },
    });
  }

  updateSpaceMapDataEntry() {
    if (this.selectedSpaceMapDataEntry && this.selectedSpaceMapDataEntryName) {
      const updateRequest: UpdateSpaceMapDataEntryRequest = {
        size: this.selectedSpaceMapDataEntry.size,
        preferredColor: this.selectedSpaceMapDataEntry.preferredColor,
      };

      this.apiService
        .updateSpaceMapDataEntry(
          this.selectedSpaceMapDataEntryName,
          updateRequest
        )
        .subscribe({
          error: (err: HttpErrorResponse) => {
            this.error = err;
            console.log(err);
          },
        });
    }
  }

  clearLoginError() {
    this.error = null;
  }

  /**
   * @deprecated This method is not used and should be removed
   */
  createDefaultStarMap() {
    const m1Map: SpaceMapDataEntry = {
      name: 'M-1',
      size: { width: 320, height: 180 },
      preferredColor: 'red',
      spawnableAliens: [],
      staticEntities: [],
    };

    const t1Map: SpaceMapDataEntry = {
      name: 'T-1',
      size: { width: 320, height: 180 },
      preferredColor: 'blue',
      spawnableAliens: [],
      staticEntities: [],
    };

    const v1Map: SpaceMapDataEntry = {
      name: 'V-1',
      size: { width: 320, height: 180 },
      preferredColor: 'green',
      spawnableAliens: [],
      staticEntities: [],
    };

    this.createAndUpdateSpaceMapDataEntry(m1Map);
    this.createAndUpdateSpaceMapDataEntry(t1Map);
    this.createAndUpdateSpaceMapDataEntry(v1Map);

    setTimeout(() => {
      this.fetchSpaceMapDataEntryNames();
    }, 300);
  }

  deleteSpaceMap(name: string) {
    this.apiService.deleteSpaceMapDataEntry(name).subscribe({
      next: () => {
        this.fetchSpaceMapDataEntryNames();
        if (this.selectedSpaceMapDataEntryName === name) {
          this.selectedSpaceMapDataEntryName = null;
          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { map: null },
            queryParamsHandling: 'merge',
          });
        }
        this.selectedSpaceMapDataEntry = null;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err;
        console.log(err);
      },
    });
  }

  /**
   * @deprecated This method is not used and should be removed
   */
  private createAndUpdateSpaceMapDataEntry(map: SpaceMapDataEntry) {
    this.apiService.postSpaceMapDataEntry(map.name).subscribe(() => {
      this.apiService.updateSpaceMapDataEntry(map.name, map).subscribe(() => {
        console.log(
          `${map.name} SpaceMapDataEntry created and updated successfully`
        );
      });
    });
  }

  private async updateUrlWithMapName(name: string) {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { map: name },
      queryParamsHandling: 'merge',
    });
  }

  protected deleteStaticEntity(staticEntity: StaticEntity) {
    if (!this.selectedSpaceMapDataEntryName) {
      console.error('No map selected');
      return;
    }
    const mapName = this.selectedSpaceMapDataEntryName;
    this.apiService.deleteStaticEntityFromMap(mapName, staticEntity).subscribe({
      next: () => {
        this.selectSpaceMapDataEntry(mapName);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err;
        console.log(err);
      },
    });
  }

  protected saveStaticEntities() {
    console.warn('Not implemented');
  }

  protected addStaticEntityToMap() {
    if (!this.selectedSpaceMapDataEntryName) {
      console.error('No map selected');
      return;
    }
    const mapName = this.selectedSpaceMapDataEntryName;
    this.apiService
      .addStaticEntityToMap(mapName, this.newStaticEntity)
      .subscribe({
        next: () => {
          this.selectSpaceMapDataEntry(mapName);
        },
        error: (err: HttpErrorResponse) => {
          this.error = err;
          console.log(err);
        },
      });
  }

  protected readonly faArrowsRotate = faArrowsRotate;

  protected newStaticEntity: CreateStaticEntityRequest = {
    name: '',
    position: { x: 0, y: 0, z: 0 },
    locationName: '',
    safeZoneRadii: 0,
    destination: '',
  };

  newSpawnableAlien: SpawnableAlien = {
    id: 0,
    name: '',
    spawnLimit: 0,
  };

  addSpawnableAlien() {
    if (!this.selectedSpaceMapDataEntry) return;

    const newAlien: SpawnableAlien = {
      id: this.selectedSpaceMapDataEntry.spawnableAliens.length + 1,
      name: this.newSpawnableAlien.name,
      spawnLimit: this.newSpawnableAlien.spawnLimit,
    };

    this.selectedSpaceMapDataEntry.spawnableAliens.push(newAlien);
    this.saveSpawnableAliens();

    // Reset the form
    this.newSpawnableAlien = {
      id: 0,
      name: '',
      spawnLimit: 0,
    };
  }

  deleteSpawnableAlien(alien: SpawnableAlien) {
    if (!this.selectedSpaceMapDataEntry) return;
    this.selectedSpaceMapDataEntry.spawnableAliens =
      this.selectedSpaceMapDataEntry.spawnableAliens.filter(
        (a) => a.id !== alien.id
      );
    this.saveSpawnableAliens();
  }

  saveSpawnableAliens() {
    if (!this.selectedSpaceMapDataEntry) return;
    this.updateSpaceMapDataEntry();
  }
}
