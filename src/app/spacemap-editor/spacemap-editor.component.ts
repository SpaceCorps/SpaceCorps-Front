import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { SpaceMapDataEntry } from '../models/dataEntries/SpaceMapDataEntry';
import { UpdateSpaceMapDataEntryRequest } from '../models/dataEntries/UpdateSpaceMapDataEntryRequest';
import { ErrorModalComponent } from '../components/error-modal/error-modal.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-spacemap-editor',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    NgClass,
    ErrorModalComponent,
  ],
  templateUrl: './spacemap-editor.component.html',
  styleUrl: './spacemap-editor.component.scss'
})
export class SpacemapEditorComponent {

  spaceMapDataEntryNames: string[] = [];
  selectedSpaceMapDataEntry: SpaceMapDataEntry | null = null;
  selectedSpaceMapDataEntryName: string | null = null;
  newSpaceMapName: string | null = null;
  error: HttpErrorResponse | null = null;

  constructor (private apiService: ApiService) {
  }

  ngOnInit () {
    this.fetchSpaceMapDataEntryNames();
  }

  fetchSpaceMapDataEntryNames () {
    this.apiService.getSpaceMapDataEntryNames().subscribe((data: string[]) => {
      this.spaceMapDataEntryNames = data;
    });
  }

  selectSpaceMapDataEntry (name: string) {
    this.selectedSpaceMapDataEntryName = name;
    this.apiService.getSpaceMapDataEntry(name).subscribe({
      next: (data: SpaceMapDataEntry) => {
        this.selectedSpaceMapDataEntry = data;
        console.log("Fetched SpaceMapDataEntry: ", data);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err;
        console.log(err);
      }
    });
  }

  postSpaceMapDataEntryByName (newName: string) {
    this.apiService.postSpaceMapDataEntry(newName).subscribe({
      next: () => {
        this.fetchSpaceMapDataEntryNames();
        this.newSpaceMapName = null;
      }, error: (err: HttpErrorResponse) => {
        this.error = err;
        console.log(err);
      }
    });
  }

  updateSpaceMapDataEntry () {
    if (this.selectedSpaceMapDataEntry && this.selectedSpaceMapDataEntryName) {
      const updateRequest: UpdateSpaceMapDataEntryRequest = {
        size: this.selectedSpaceMapDataEntry.size,
        preferredColor: this.selectedSpaceMapDataEntry.preferredColor,
      };

      this.apiService.updateSpaceMapDataEntry(this.selectedSpaceMapDataEntryName, updateRequest)
        .subscribe({
          error: (err: HttpErrorResponse) => {
            this.error = err;
            console.log(err);
          }
        });
    }
  }

  clearLoginError () {
    this.error = null;
  }

  createDefaultStarMap () {

    const m1Map: SpaceMapDataEntry = {
      name: 'M-1',
      size: { width: 320, height: 180 },
      preferredColor: 'red',
      spawnableAliens: [],
      staticEntities: []
    }

    const t1Map: SpaceMapDataEntry = {
      name: 'T-1',
      size: { width: 320, height: 180 },
      preferredColor: 'blue',
      spawnableAliens: [],
      staticEntities: []
    }

    const v1Map: SpaceMapDataEntry = {
      name: 'V-1',
      size: { width: 320, height: 180 },
      preferredColor: 'green',
      spawnableAliens: [],
      staticEntities: []
    }

    this.createAndUpdateSpaceMapDataEntry(m1Map);
    this.createAndUpdateSpaceMapDataEntry(t1Map);
    this.createAndUpdateSpaceMapDataEntry(v1Map);

    this.fetchSpaceMapDataEntryNames();
  }

  deleteSpaceMap(name: string) {
    this.apiService.deleteSpaceMapDataEntry(name).subscribe({
      next: () => {
        this.fetchSpaceMapDataEntryNames();
        if (this.selectedSpaceMapDataEntryName === name) {
          this.selectedSpaceMapDataEntry = null;
          this.selectedSpaceMapDataEntryName = null;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error = err;
        console.log(err);
      }
    });
  }

  private createAndUpdateSpaceMapDataEntry (map: SpaceMapDataEntry) {
    this.apiService.postSpaceMapDataEntry(map.name).subscribe(() => {
      this.apiService.updateSpaceMapDataEntry(map.name, map).subscribe(() => {
        console.log(`${map.name} SpaceMapDataEntry created and updated successfully`);
      });
    });
  }
}
