// Font-Awesome Icons
import { faCircleNotch, faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { Component, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from "../core/services";

import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as os from 'os';

@Component({
  selector: 'app-encrypt',
  templateUrl: './encrypt.component.html',
  styleUrls: ['./encrypt.component.scss']
})
export class EncryptComponent {

  // Font Awesome
  faCircleNotch = faCircleNotch;
  faLock = faLock;
  faLockOpen = faLockOpen;

  // Font Awesome
  isLoading = false;
  isValid = false;

  pubKeyLocation: string;
  unencryptedFileLocation: string;

  // Variables Used in Generating Encrypted Files
  private filename = 'gk-package';
  private infoFilename = 'gk-info';
  private keyEncFilename = 'gk-enc-key';
  private keyFilename = 'gk-key';
  private tmpDir = os.tmpdir();
  private tmpEncKeyFilename = `${this.tmpDir}/${this.keyEncFilename}`;
  private tmpInfoFilename = `${this.tmpDir}/${this.infoFilename}`;
  private tmpKeyFilename = `${this.tmpDir}/${this.keyFilename}`;
  private tmpFilename = `${this.tmpDir}/${this.filename}`;

  // Commands
  private genTokenCommand = `/usr/bin/openssl rand -out "${this.tmpKeyFilename}" -hex 122`;

  constructor(private cdRef: ChangeDetectorRef, private electron: ElectronService) { }

  private cleanUp(): void {
    try {
      // Delete Tmp File (if exists) (File selected from user)
      if (fs.existsSync(this.tmpFilename))
        fs.unlinkSync(this.tmpFilename);

      // Delete Tmp File (if exists) (Generated key)
      if (fs.existsSync(this.tmpKeyFilename))
        fs.unlinkSync(this.tmpKeyFilename);

      // Delete Tmp File (if exists) (Generated encrypted key)
      if (fs.existsSync(this.tmpEncKeyFilename))
        fs.unlinkSync(this.tmpEncKeyFilename);

      // Delete Tmp File (if exists) (Generated info file)
      if (fs.existsSync(this.tmpInfoFilename))
        fs.unlinkSync(this.tmpInfoFilename);

      console.log("Cleaned up files from encryption successfully!");
    } catch (e) {
      console.error(`Error cleaning up files from encryption with message: ${e}`);
    }
  }

  clearFormContents(): void {
    this.pubKeyLocation = '';
    this.unencryptedFileLocation = '';
    this.cdRef.detectChanges();
  }

  encryptFile(): void {
    this.isLoading = true;

    console.log(this.genTokenCommand);

    // Gen Random Key for Encryption
    childProcess.execSync(this.genTokenCommand);

    if (!fs.existsSync(this.tmpKeyFilename)) {
      alert(`Token generated from command was empty. Cannot encrypt.`);
      this.isLoading = false;
      return;
    }

    // Encrypt Selected File
    const command = `/usr/bin/openssl enc -aes-256-cbc -salt -in "${this.unencryptedFileLocation}" -out ${this.tmpFilename} -pass file:${this.tmpKeyFilename}`;
    childProcess.exec(command, (err, stdout, stderr) => {
      if (err || stderr) {
        console.error(`ERR: ${err}`);
        console.error(`STDERR: ${stderr}`);
        alert(`An error occurred while encrypting your file with message: \r\n\r\n${err ? err : stderr}`);

        this.cleanUp();
        this.isLoading = false;
        this.cdRef.detectChanges();
        return;
      }

      if (fs.existsSync(this.tmpFilename))
        this.packageFileContents();
      else {
        console.warn("File created from encryption was not found");
        alert("Encrypted file was not found. Please try again");
        this.cleanUp();
        this.isLoading = false;
        this.cdRef.detectChanges();
        return;
      }
    });

    this.isLoading = false;
  }

  openDialog(inputKey: string): void {
    this.electron.remote.dialog.showOpenDialog({
      buttonLabel: inputKey == 'pubKey' ? 'Select Recipient\'s Public Cert' : 'Select Unencrpyted File',
      filters: [{
        name: inputKey == 'pubKey' ? 'Public Cert' : 'Unencrypted File',
        extensions: inputKey == 'pubKey' ? ['cer'] : ['*']
      }]
    }).then((result) => {
      if (!result.canceled && result.filePaths.length == 1) {
        let fileLocation = result.filePaths[0];

        if (inputKey === 'pubKey')
          this.pubKeyLocation = fileLocation;
        else
          this.unencryptedFileLocation = fileLocation;
      } else {
        console.log("User canceled file selection event");
      }
    }).catch((err) => {
      console.error(err);
      alert(`There was an error selecting your file with message: \r\n\r\n${err}`);
    }).finally(() => {
      this.validateForm();
    });
  }

  private packageFileContents(): void {
    // Encrypt Key 
    // if (fs.existsSync(this.tmpKeyFilename) && fs.existsSync(this.pubKeyLocation)) {
    if (fs.existsSync(this.tmpKeyFilename) && fs.existsSync(this.pubKeyLocation)) {
      const encryptKeyCommand = `/usr/bin/openssl rsautl -encrypt -inkey "${this.pubKeyLocation}" -in ${this.tmpKeyFilename} -pubin -out ${this.tmpEncKeyFilename}`;

      childProcess.exec(encryptKeyCommand, (err, _, stderr) => {
        if (err || stderr) {
          this.cleanUp();

          console.error(`There was an error encrypting the encryption key with message: ${err ? err : stderr}`);
          alert(`There was an error encrypting the encryption key with message: \r\n\r\n${err ? err : stderr}`);
          this.isLoading = false;
          this.cdRef.detectChanges();
          return;
        } else {
          // Generate Info File
          let selectedFilename;
          if (this.unencryptedFileLocation.lastIndexOf('/') > -1)
            selectedFilename = this.unencryptedFileLocation.substr(this.unencryptedFileLocation.lastIndexOf('/') + 1);
          else
            selectedFilename = this.unencryptedFileLocation;

          try {
            fs.writeFileSync(this.tmpInfoFilename, selectedFilename);
          } catch (e) {
            this.cleanUp();

            console.error(`There was an error saving file information to file with message: ${e}`);
            alert(`There was an error saving file information to file with message: \r\n\r\n${e}`);
            this.isLoading = false;
            this.cdRef.detectChanges();
            return;
          }

          // Zip Everything Together (.gke - Gate-Keeper-Encrypted)
          const zipFilename = `${this.tmpDir}/${selectedFilename}.gke`;
          const zipCommand = `zip -j "${zipFilename}" ${this.tmpFilename} ${this.tmpInfoFilename} ${this.tmpEncKeyFilename}`;
          childProcess.exec(zipCommand, (err, _, stderr) => {
            if (err || stderr) {
              this.cleanUp();

              console.error(`There was an error zipping contents into package with error: ${err ? err : stderr}`);
              alert(`There was an error zipping contents into package with error: \r\n\r\n${err ? err : stderr}`);
              this.isLoading = false;
              this.cdRef.detectChanges();
              return;
            }

            // Little bit of parsing to remove file type extension
            let filenameWoExtension = selectedFilename;
            if (filenameWoExtension.lastIndexOf('.') > -1)
              filenameWoExtension = filenameWoExtension.substr(0, filenameWoExtension.lastIndexOf('.'));

            // Get Final Location
            this.electron.remote.dialog.showSaveDialog({
              buttonLabel: 'Save Encrypted File',
              defaultPath: `${filenameWoExtension}.gke`,
              filters: [{ 
                name: 'Gate Keeper Encrypted',
                extensions: ['gke']
              }],
              nameFieldLabel: 'Encrypted Filename',
              title: "Select Location for New Encrypted File"
            }).then((result) => {
              if (!result.canceled && result.filePath !== '') {
                // Move Tmp Encrypted File to Final Dest
                fs.renameSync(`${zipFilename}`, result.filePath);

                // Alert user that the operation completed successfully
                alert(`Encryption successful! File located at ${result.filePath}`);

                this.clearFormContents();
                this.validateForm();
              } else {
                console.log("User canceled save dialog");
              }
              
              this.cleanUp();
              this.isLoading = false;
              this.cdRef.detectChanges();
            });
          });
        }
      });
    } else {
      this.cleanUp();

      console.error("Couldn't find generated key used for encryption");
      alert("Couldn't find generated key used for encryption");
      this.isLoading = false;
      this.cdRef.detectChanges();
      return;
    }
  }

  validateForm(): void {
    if (
      this.pubKeyLocation &&
      this.pubKeyLocation !== '' &&
      this.unencryptedFileLocation &&
      this.unencryptedFileLocation !== ''
    )
      this.isValid = true;
    else
      this.isValid = false;
  }

}
