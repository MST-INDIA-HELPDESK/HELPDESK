import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedComponent } from './canned.component';

describe('CannedComponent', () => {
  let component: CannedComponent;
  let fixture: ComponentFixture<CannedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CannedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
