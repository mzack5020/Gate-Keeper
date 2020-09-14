import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenPubCertComponent } from './gen-pub-cert.component';

describe('GenPemCertComponent', () => {
  let component: GenPubCertComponent;
  let fixture: ComponentFixture<GenPubCertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenPubCertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenPubCertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
