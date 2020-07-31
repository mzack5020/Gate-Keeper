import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenPemCertComponent } from './gen-pem-cert.component';

describe('GenPemCertComponent', () => {
  let component: GenPemCertComponent;
  let fixture: ComponentFixture<GenPemCertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenPemCertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenPemCertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
