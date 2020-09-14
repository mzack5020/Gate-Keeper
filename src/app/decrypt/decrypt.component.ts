import { Component, ChangeDetectorRef } from '@angular/core';

// Font Awesome
import { faBan, faCircleNotch, faLockOpen, faSimCard } from "@fortawesome/free-solid-svg-icons";
import { ElectronService } from '../core/services';

// NgbModal
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import * as childProcess from 'child_process'; // Used to interact with terminal
import * as fs from 'fs';                      // Used to interact with file system
import * as os from 'os';                      // Used to interact with operating system
import { AppConfig } from '../../environments/environment';

@Component({
  selector: 'app-decrypt',
  templateUrl: './decrypt.component.html',
  styleUrls: ['./decrypt.component.scss']
})
export class DecryptComponent {

  // Font Awesome
  faBan = faBan;
  faCircleNotch = faCircleNotch;
  faLockOpen = faLockOpen;
  faSimCard = faSimCard;

  isLoading = false;
  isValid = false;
  pivPin = '';

  // Form Values
  encryptedFileLocation: string;

  // Variables Used in Generating Encrypted Files
  // Variables Used in Generating Encrypted Files
  private filename = 'gk-package';
  private infoFilename = 'gk-info';
  private keyEncFilename = 'gk-enc-key';
  private keyFilename = 'gk-key';
  private tmpDir = os.tmpdir();
  private tmpDecryptedFilename = `${this.tmpDir}/gate-keeper-tmp-${Date.now()}`;
  private tmpEncKeyFilename = `${this.tmpDir}/${this.keyEncFilename}`;
  private tmpInfoFilename = `${os.tmpdir}/${this.infoFilename}`;
  private tmpKeyFilename = `${this.tmpDir}/${this.keyFilename}`;
  private tmpFilename = `${this.tmpDir}/${this.filename}`;

  constructor(
    private cdRef: ChangeDetectorRef,
    private electron: ElectronService,
    private modalService: NgbModal
  ) { }

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
    this.encryptedFileLocation = '';
  }

  decryptFile(): void {
    this.isLoading = true;
    this.cdRef.detectChanges();

    // Ensure Encrypted File Location Exists
    if (this.encryptedFileLocation && this.pivPin) {
      // Unzip
      try {
        const unzipCommand = `unzip -o "${this.encryptedFileLocation}" -d ${this.tmpDir}`;
        childProcess.execSync(unzipCommand);

        // Validate All Required Files are Present
        if (
          !fs.existsSync(this.tmpFilename) ||
          !fs.existsSync(this.tmpInfoFilename) ||
          !fs.existsSync(this.tmpEncKeyFilename)
        ) {
          console.error("Not all files were found in the deconstructed file!");
          alert("Not all files were found in the deconstructed file!");
          this.cleanUp();

          this.modalService.dismissAll();
          this.isLoading = false;
          this.cdRef.detectChanges();
          return;
        }
      } catch (e) {
        this.cleanUp();

        console.error(`There was an error deconstructing your file with message: \r\n\r\n${e}`);
        alert(`There was an error deconstructing your file with message: \r\n\r\n${e}`);
        this.modalService.dismissAll();
        this.isLoading = false;
        this.cdRef.detectChanges();
        return;
      }

      // Discover Certificate ID from Label
      let id;
      try {
        const discoverIdCommand = `/usr/local/bin/pkcs11-tool --type cert -O 2>/dev/null | egrep -A 2 "${AppConfig.pivLabel}$"|egrep "ID:"|awk '{print $2}'`;
        id = childProcess.execSync(discoverIdCommand).toString();

        if (!id) {
          this.cleanUp();

          console.error("There was an error finding the ID for your certificate. Please re-insert your PIV and try again.");
          alert("There was an error finding the ID for your certificate. Please re-insert your PIV and try again.");

          this.modalService.dismissAll();
          this.isLoading = false;
          this.cdRef.detectChanges();
          return;
        } 

        console.log(`ID retrieved successfully: ${id}`);
      } catch (e) {
        this.cleanUp();

        console.error(`There was an error discovering ID for ceritificate label ${AppConfig.pivLabel} with message: \r\n\r\n${e}`);
        alert(`There was an error discovering ID for ceritificate label ${AppConfig.pivLabel} with message: \r\n\r\n${e}`);
        this.modalService.dismissAll();
        this.isLoading = false;
        this.cdRef.detectChanges();
        return;
      }

      // Decrypt Key Using Private
      // Use PIN to decrypt file
      const decryptCommand = `/usr/local/bin/pkcs11-tool --decrypt --id ${id.trim()} -m RSA-PKCS --module /usr/local/lib/opensc-pkcs11.so -p ${this.pivPin} --input-file ${this.tmpEncKeyFilename} --output-file ${this.tmpKeyFilename}`;
      childProcess.exec(decryptCommand, (err, _, __) => {
        if (err) {
          this.cleanUp();

          // Dismiss PIN Modal
          this.modalService.dismissAll();

          // Alert User of Error
          console.error(`There was an error decrypting the encryption key with error: \r\n\r\n${err}`);
          alert(`There was an error decrypting the encryption key with error: \r\n\r\n${err}`);
          this.modalService.dismissAll();
          this.isLoading = false;
          this.cdRef.detectChanges();
          return;
        }

        console.log(`File Exists: ${fs.existsSync(this.tmpFilename)}`);

        // Decrypt File Using Key
        const decryptFileCommand = `/usr/bin/openssl enc -d -aes-256-cbc -in ${this.tmpFilename} -out "${this.tmpDecryptedFilename}" -pass file:${this.tmpKeyFilename}`;
        console.log(decryptFileCommand);
        childProcess.exec(decryptFileCommand, (err, stdout, stderr) => {

          if (err) {
            this.cleanUp();

            console.error(`There was an error decrypting your file with message: \r\n\r\n${err}`);
            alert(`There was an error decrypting your file with message: \r\n\r\n${err}`);
            this.modalService.dismissAll();
            this.isLoading = false;
            this.cdRef.detectChanges();
            return;
          }

          // Read Info File
          const origFilename = fs.readFileSync(this.tmpInfoFilename);
          if (!origFilename)
            console.warn("Filename couldn't be retrieved from info file. Skipping filename preselect");

          // Save Decrypted File to User's Selection
          this.electron.remote.dialog.showSaveDialog({
            buttonLabel: 'Save Decrypted File',
            defaultPath: `${origFilename ? origFilename : ''}`,
            nameFieldLabel: 'Decrypted Filename',
            title: "Select Location for New Decrypted File"
          }).then((result) => {
            if (!result.canceled && result.filePath !== '') {
              // Move Tmp Encrypted File to Final Dest
              fs.renameSync(`${this.tmpDecryptedFilename}`, result.filePath);

              // Alert user that the operation completed successfully
              alert(`Decryption successful! File located at ${result.filePath}`);

              this.clearFormContents();
              this.validateForm();
            } else {
              console.log("User canceled save dialog");
            }

            // this.cleanUp();
            this.modalService.dismissAll();
            this.isLoading = false;
            this.cdRef.detectChanges();
          });
        });
      });
    } else {
      console.warn("Decrypt file function called without providing encrypted file location or PIV pin");
      this.isLoading = false;
    }
  }

  openDialog(): void {
    this.electron.remote.dialog.showOpenDialog({
      buttonLabel: 'Select Encrypted File',
      filters: [{
        name: 'Gate Keeper Encrypted',
        extensions: ['gke']
      }]
    }).then((result) => {
      if (!result.canceled && result.filePaths.length == 1)
        this.encryptedFileLocation = result.filePaths[0];
      else
        console.log("User canceled file selection event");
    }).catch((err) => {
      console.error(err);
      alert(`There was an error selecting your encrypted file with message: ${err}`);
    }).finally(() => {
      this.validateForm();
      this.cdRef.detectChanges();
    });
  }

  retrievePin(modalId): void {
    if (this.isValid) {
      this.modalService.open(modalId, { ariaLabelledBy: 'decrypt-modal-title' });
    } else {
      console.warn("User must specify encrypted file location first before executing this function");
      alert("You must specify the encrypted file's location first!");
    }
  }

  setPin(pin: string): void {
    this.pivPin = pin;
  }

  validateForm(): void {
    this.isValid = this.encryptedFileLocation && this.encryptedFileLocation != '';
  }

}
