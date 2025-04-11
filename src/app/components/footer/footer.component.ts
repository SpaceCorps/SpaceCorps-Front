import { Component, inject, OnInit } from '@angular/core';
import packageJson from '../../../../package.json';
import { ApiService } from '../../services/api.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  imports: [NgClass],
})
export class FooterComponent implements OnInit {
  clientVersion: string = packageJson.version;
  requiredBackendVersion: string = packageJson.reqBackendVersion;
  outDated: boolean = false;
  serverVersion: string | null = null;

  apiService = inject(ApiService);

  ngOnInit() {
    this.apiService.getBackendVersion().subscribe({
      next: (serverInfo) => {
        this.serverVersion = serverInfo.version;

        if (!this.serverVersion) return;

        this.outDated =
          this.getMinorVersion(this.serverVersion) >
          this.getMinorVersion(this.requiredBackendVersion);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  private getMinorVersion(fullVersion: string): number {
    return parseInt(fullVersion.split('.')[1]);
  }
}
