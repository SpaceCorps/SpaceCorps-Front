import { Component, inject, OnInit, effect } from '@angular/core';
import packageJson from '../../../../package.json';
import { StateService } from '../../services/state.service';
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

  stateService = inject(StateService);

  constructor() {
    // Set up effect to watch server version changes
    effect(() => {
      const serverInfo = this.stateService.currentServerInfo();
      if (serverInfo) {
        this.serverVersion = serverInfo.version;
        if (this.serverVersion) {
          this.outDated =
            this.getMinorVersion(this.serverVersion) >
            this.getMinorVersion(this.requiredBackendVersion);
        }
      }
    });
  }

  ngOnInit() {
    // Initial fetch of server info
    this.stateService.fetchServerInfo();
  }

  private getMinorVersion(fullVersion: string): number {
    return parseInt(fullVersion.split('.')[1]);
  }
}
