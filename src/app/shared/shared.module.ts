import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [PageNotFoundComponent, FooterComponent, NavbarComponent, WebviewDirective],
  imports: [CommonModule, TranslateModule, FormsModule, FontAwesomeModule, RouterModule],
  exports: [TranslateModule, FooterComponent, NavbarComponent, WebviewDirective, FormsModule, FontAwesomeModule]
})
export class SharedModule {}
