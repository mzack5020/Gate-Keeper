import { Component, ChangeDetectorRef } from '@angular/core';
import { AppConfig } from '../../environments/environment';

// Font Awesome
import { faCircleNotch, faCogs } from "@fortawesome/free-solid-svg-icons";
import { ElectronService } from '../core/services';

import * as childProcess from 'child_process'; // Used to interact with terminal
import * as fs from 'fs';                      // Used to interact with file system
import * as os from 'os';                      // Used to interact with operating system
import * as path from 'path';                  // Used to get os specific path delimiters

@Component({
  selector: 'app-gen-pem-cert',
  templateUrl: './gen-pem-cert.component.html',
  styleUrls: ['./gen-pem-cert.component.scss']
})
export class GenPemCertComponent {

  isLoading = false;

  // Font Awesome
  faCircleNotch = faCircleNotch;
  faCogs = faCogs;

  // Variables Used in Generating Encrypted Files
  private tmpDir = os.tmpdir();

  private getSubjectCommand = `/usr/local/bin/pkcs11-tool -r --type cert --label "${AppConfig.pivLabel}" 2>/dev/null | /usr/bin/openssl x509 -inform DER -noout -subject`;

  constructor(
    private cdRef: ChangeDetectorRef,
    private electron: ElectronService
  ) { }

  genPemFile(): void {
    this.isLoading = true;
    this.cdRef.detectChanges();

    childProcess.exec(`${this.getSubjectCommand}`, (error, stdout, stderr) => {
      if (error) {
        this.isLoading = false;
        console.error(`Error running shell script: ${error}`);
        alert(`There was an error processing your request.\r\n${error}\r\n`);
        this.cdRef.detectChanges();
      } else {
        let valid = true;
        let subjectName = '';

        if (!stdout || stdout.indexOf('CN') == -1) {
          valid = false;
        }

        if (valid) {
          subjectName = stdout.substr(stdout.indexOf('CN'));
          if (subjectName.indexOf('=') > -1 && subjectName.indexOf('=') + 1 <= subjectName.length) {
            subjectName = subjectName.substr(subjectName.indexOf('=') + 1);
          } else
            valid = false;
        }

        if (valid) {
          if (subjectName.indexOf('(') > -1)
            subjectName = subjectName.substr(0, subjectName.indexOf('('));
          subjectName = subjectName.trim().split(' ').join('-');
        }

        // Fixes some odd stuff that happens when the CN is malformed
        if (valid) {
          if (subjectName.indexOf('/UID') > -1)
            subjectName = subjectName.substr(0, subjectName.indexOf('/UID'));
        }

        if (valid) {
          const generatedFilename = subjectName.trim();
          const tmpFilename = `${this.tmpDir}${path.delimiter}${generatedFilename}`;
          const genPemCommand = `/usr/local/bin/pkcs11-tool -r --type cert --label "${AppConfig.pivLabel}" | /usr/bin/openssl x509 -inform DER -pubkey > ${tmpFilename}`;
          childProcess.exec(genPemCommand, (error, stdout, stderr) => {
            if (error) {
              // Delete Tmp File (if created/exists)'
              if (fs.existsSync(`${tmpFilename}`)) {
                fs.unlinkSync(`${tmpFilename}`);
                console.log("Tmp file deleted successfully!");
              }

              // Show Error in GUI
              alert(`There was an error encrypting your file. \r\n\r\nIs your PIV plugged in?\r\n\r\n${error}`);

              this.isLoading = false;
              this.cdRef.detectChanges();
            } else {
              this.electron.remote.dialog.showSaveDialog({
                buttonLabel: 'Save PEM File',
                filters: [{
                  name: 'PEM',
                  extensions: ['pem']
                }],
                defaultPath: generatedFilename,
                nameFieldLabel: 'PEM Filename',
                title: "Select Location for New PEM File"
              }).then((result) => {
                if (!result.canceled && result.filePath !== '') {
                  console.log("TMP FILENAME: ", tmpFilename);
                  console.log(fs.existsSync(tmpFilename.trim()));

                  // Move Tmp Encrypted File to Final Dest
                  fs.renameSync(`${tmpFilename}`, result.filePath);

                  // Alert user that the operation completed successfully
                  alert(`PEM creation successful! File located at ${result.filePath}`);
                } else {
                  console.log("User canceled save dialog");
                }

                this.isLoading = false;
                this.cdRef.detectChanges();
              });
            }
          });
        } else {
          this.isLoading = false;
          this.cdRef.detectChanges();
          alert('There was an error parsing the subject name retrieved from your PIV. Please try to remove and reinsert your PIV to try again.');
        }
      }
    });
  }
}
