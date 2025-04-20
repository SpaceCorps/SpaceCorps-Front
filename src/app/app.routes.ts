import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: async () => {
      const module = await import('./home/home.component');
      return module.HomeComponent;
    },
  },
  {
    path: 'login',
    loadComponent: async () => {
      const module = await import('./login/login.component');
      return module.LoginComponent;
    },
  },
  {
    path: 'lobby',
    canActivate: [authGuard],
    loadComponent: async () => {
      const module = await import('./lobby/lobby.component');
      return module.LobbyComponent;
    },
  },
  {
    path: 'pilot-info',
    canActivate: [authGuard],
    loadComponent: async () => {
      const module = await import('./pilot-info/pilot-info.component');
      return module.PilotInfoComponent;
    },
  },
  {
    path: 'game',
    canActivate: [authGuard],
    loadComponent: async () => {
      const module = await import('./game/game.component');
      return module.GameComponent;
    },
  },
  {
    path: 'spacemap-editor',
    canActivate: [authGuard],
    loadComponent: async () => {
      const module = await import(
        './spacemap-editor/spacemap-editor.component'
      );
      return module.SpacemapEditorComponent;
    },
  },
  {
    path: 'itemEntry-editor',
    canActivate: [authGuard],
    loadComponent: async () => {
      const module = await import(
        './itemEntry-editor/itemEntry-editor.component'
      );
      return module.ItemEntryEditorComponent;
    },
  },
  {
    path: 'ship-yard',
    canActivate: [authGuard],
    loadComponent: async () => {
      const module = await import('./ship-yard/ship-yard.component');
      return module.ShipYardComponent;
    },
  },
  {
    path: 'users-editor',
    canActivate: [authGuard],
    loadComponent: async () => {
      const module = await import('./users-editor/users-editor.component');
      return module.UsersEditorComponent;
    },
  },
  {
    path: 'pilot-inventory',
    canActivate: [authGuard],
    loadComponent: async () => {
      const module = await import(
        './pilot-inventory/pilot-inventory.component'
      );
      return module.PilotInventoryComponent;
    },
  },
  {
    path: 'lore',
    canActivate: [authGuard],
    loadComponent: async () => {
      const module = await import('./lore/lore.component');
      return module.LoreComponent;
    },
  },
  {
    path: 'clans',
    canActivate: [authGuard],
    loadComponent: () => import('./clans/clans.component').then(m => m.ClansComponent),
    title: 'Clans'
  },
];
