import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaPoliciesSettingsComponent } from './sla-policies-settings.component';

describe('SlaPoliciesSettingsComponent', () => {
  let component: SlaPoliciesSettingsComponent;
  let fixture: ComponentFixture<SlaPoliciesSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlaPoliciesSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlaPoliciesSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
