import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

import { HomeRoutingModule } from './home/home-routing.module';
import { EncryptComponent } from './encrypt/encrypt.component';
import { DecryptComponent } from './decrypt/decrypt.component';
import { GenPemCertComponent } from './gen-pem-cert/gen-pem-cert.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'genPemCert',
    component: GenPemCertComponent
  },
  {
    path: 'encrypt',
    component: EncryptComponent
  },
  {
    path: 'decrypt',
    component: DecryptComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    HomeRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
