import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdesksettingsComponent } from './helpdesksettings.component';

describe('HelpdesksettingsComponent', () => {
  let component: HelpdesksettingsComponent;
  let fixture: ComponentFixture<HelpdesksettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpdesksettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpdesksettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
