# SpaceCorpsFront

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Electron Build

This project includes an Electron wrapper for desktop deployment. To build and run the Electron application:

1. Development mode:

   ```bash
   npm run start-electron
   ```

   This will build the Angular app, compile Electron code, and start the application in development mode.

2. Create distributable executables:

   ```bash
   npm run dist-electron
   ```

   This will create platform-specific executables in the `dist/electron` directory:

   - Windows: NSIS installer (x64 and arm64)
   - macOS: DMG package
   - Linux: AppImage

3. Create unpacked version (useful for testing):
   ```bash
   npm run pack-electron
   ```

The build process ensures that the Angular static content is properly bundled with the Electron application. The final executable includes all necessary files from both the Angular build (`dist/space-corps-front/browser`) and the Electron build (`dist/electron`).

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
