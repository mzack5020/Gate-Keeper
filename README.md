[![Angular Logo](https://www.vectorlogo.zone/logos/angular/angular-icon.svg)](https://angular.io/) [![Electron Logo](https://www.vectorlogo.zone/logos/electronjs/electronjs-icon.svg)](https://electronjs.org/)

![Maintained][maintained-badge]
![Github Action Build Status][build-badge]
[![Make a pull request][prs-badge]][prs]
[![License](http://img.shields.io/badge/Licence-MIT-brightgreen.svg)](LICENSE.md)

# Introduction

Utility application to interact easily with PIV certificates. Specific features include:
 - **Generate public certificate (PEM)** so senders can encrypt files designated for only you 
 - **Decrypt Files** using private certificates located on insert PIV card
 - **Encrypt Files** using public PEM certificates provided by recipients

# How It Works
 - **Generate public certificate (PEM)**
    * Leverages the pkcs11-tool and OpenSSL to take the public certificate from the PIV and convert it to a PEM
- **Encryption**
    1) First the user selects the file they want to encrypt. Currently, the application only supports encrypting one file at a time. *If you want to encrypt multiple files, zip them together first and then encrypt the zip using this tool.*
    2) The application then generates a 122 byte random key using OpenSSL.
    3) Once the key is generated, the application encrypts the file using AES256 encryption, leveraging the newly generated key in the process.
    4) The application then encrypts the key with the public cert provided (this cert should be provided by the recipient).
    5) The application then saves the original filename and records this in an info file for use during decryption.
    6) The application then zips all of these files (encrypted key, info file, and encrypted file) together using the file extension .gke (Gate Keeper Encryption)
- **Decryption**
    1) The application unzips the .gke
    2) Then the application uses the private key from the PIV using the supplied PIN to decrypt the key.
    3) With the decrypted key, the application decrypts the file.
    4) Then the user is prompted to save the newly decrypted file, with the filename pre-filled from the info file provided.

# Backing Technology Summary

### Forked from [Angular-Electron](https://github.com/maximegris/angular-electron)

Bootstrap and package your project with Angular 9 and Electron 8 (Typescript + SASS + Hot Reload) for creating Desktop applications.

Currently runs with:

- Angular v9.1.1
- Electron v8.2.1
- Electron Builder v22.4.1

With this sample, you can :

- Run your app in a local development environment with Electron & Hot reload
- Run your app in a production environment
- Package your app into an executable file for Linux, Windows & Mac

/!\ Hot reload only pertains to the renderer process. The main electron process is not able to be hot reloaded, only restarted.

/!\ Angular 9.x CLI needs Node 10.13 or later to works correctly.

## Getting Started

Clone this repository locally :

``` bash
git clone https://github.com/circuitswitch/PivTools.git
```

Install dependencies with npm :

``` bash
npm install
```

There is an issue with `yarn` and `node_modules` when the application is built by the packager. Please use `npm` as dependencies manager.


If you want to generate Angular components with Angular-cli , you **MUST** install `@angular/cli` in npm global context.
Please follow [Angular-cli documentation](https://github.com/angular/angular-cli) if you had installed a previous version of `angular-cli`.

``` bash
npm install -g @angular/cli
```

## To build for development

- **in a terminal window** -> npm start

Voila! You can use your Angular + Electron app in a local development environment with hot reload !

The application code is managed by `main.ts`. In this sample, the app runs with a simple Angular App (http://localhost:4200) and an Electron window.
The Angular component contains an example of Electron and NodeJS native lib import.
You can disable "Developer Tools" by commenting `win.webContents.openDevTools();` in `main.ts`.

## Included Commands

|Command|Description|
|--|--|
|`npm run ng:serve:web`| Execute the app in the browser |
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:linux`| Builds your application and creates an app consumable on linux system |
|`npm run electron:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run electron:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |

**Your application is optimised. Only /dist folder and node dependencies are included in the executable.**

## You want to use a specific lib (like rxjs) in electron main thread ?

YES! You can do it! Just by importing your library in npm dependencies section (not **devDependencies**) with `npm install --save`. It will be loaded by electron during build phase and added to your final package. Then use your library by importing it in `main.ts` file. Quite simple, isn't it ?

## Browser mode

Maybe you want to execute the application in the browser with hot reload ? Just run `npm run ng:serve:web`.
**Note that you can't use Electron or NodeJS native libraries in this case.** Please check `providers/electron.service.ts` to watch how conditional import of electron/Native libraries is done.

[build-badge]: https://github.com/circuitswitch/PivTools/workflows/Build/badge.svg
[license-badge]: https://img.shields.io/badge/license-Apache2-blue.svg?style=style=flat-square
[license]: https://github.com/maximegris/angular-electron/blob/master/LICENSE.md
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[github-star]: https://github.com/maximegris/angular-electron/stargazers
[maintained-badge]: https://img.shields.io/badge/maintained-yes-brightgreen
