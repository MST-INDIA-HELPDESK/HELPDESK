import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllnotificationsComponent } from './allnotifications.component';

describe('AllnotificationsComponent', () => {
  let component: AllnotificationsComponent;
  let fixture: ComponentFixture<AllnotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllnotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllnotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
